import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Radio, Clock, AlertTriangle, ChevronRight, Locate, X, Phone, MessageCircle, Radar, ArrowUpDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useNavigate } from "react-router-dom";

interface ServiceRequest {
  id: string;
  name: string;
  location: string;
  service_type: string;
  urgency: string;
  created_at: string;
  status: string;
  phone: string;
  concern: string;
}

interface Props {
  serviceRadius?: number;
}

const urgencyConfig: Record<string, { color: string; label: string; pulse: boolean; badge: string }> = {
  high: { color: "bg-red-500", label: "Urgent", pulse: true, badge: "destructive" },
  medium: { color: "bg-amber-500", label: "Medium", pulse: false, badge: "secondary" },
  low: { color: "bg-emerald-500", label: "Low", pulse: false, badge: "outline" },
};

// Pin positions with simulated distances (in km) from center
const pinPositions = [
  { top: "20%", left: "25%", distance: 3.2 },
  { top: "40%", left: "60%", distance: 1.8 },
  { top: "55%", left: "15%", distance: 7.5 },
  { top: "30%", left: "75%", distance: 12.3 },
  { top: "65%", left: "45%", distance: 4.1 },
  { top: "15%", left: "50%", distance: 8.9 },
  { top: "50%", left: "35%", distance: 2.4 },
  { top: "35%", left: "85%", distance: 14.7 },
  { top: "70%", left: "70%", distance: 9.6 },
  { top: "25%", left: "45%", distance: 5.3 },
];

const fallbackCenter = { lat: 18.5204, lng: 73.8567 };

// Calculate radius size in percentage based on km (approximate for visual)
const getRadiusSize = (km: number) => {
  // Map 5km -> 30%, 10km -> 50%, 15km -> 70%
  return Math.min(20 + km * 3.5, 80);
};

const LiveRequestMap = ({ serviceRadius = 10 }: Props) => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPin, setSelectedPin] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"distance" | "time" | "urgency">("distance");
  const { location: userLocation, loading: geoLoading } = useGeolocation();
  const navigate = useNavigate();

  const center = userLocation || fallbackCenter;

  const fetchRequests = async () => {
    const { data } = await supabase
      .from("concerns")
      .select("id, name, location, service_type, urgency, created_at, status, phone, concern")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) setRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();

    const channel = supabase
      .channel("live-requests")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "concerns" },
        () => fetchRequests()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Attach simulated distance to each request
  const requestsWithDistance = useMemo(() => {
    return requests.map((req, i) => ({
      ...req,
      distance: pinPositions[i]?.distance ?? 5 + Math.random() * 10,
      withinRadius: (pinPositions[i]?.distance ?? 10) <= serviceRadius,
    }));
  }, [requests, serviceRadius]);

  // Sort requests
  const sortedRequests = useMemo(() => {
    const sorted = [...requestsWithDistance];
    switch (sortBy) {
      case "distance":
        return sorted.sort((a, b) => a.distance - b.distance);
      case "urgency":
        const urgencyOrder = { high: 0, medium: 1, low: 2 };
        return sorted.sort((a, b) => (urgencyOrder[a.urgency as keyof typeof urgencyOrder] ?? 1) - (urgencyOrder[b.urgency as keyof typeof urgencyOrder] ?? 1));
      case "time":
      default:
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  }, [requestsWithDistance, sortBy]);

  // Filter to show within radius first
  const withinRadiusCount = requestsWithDistance.filter(r => r.withinRadius).length;

  const bbox = `${center.lng - 0.08},${center.lat - 0.05},${center.lng + 0.08},${center.lat + 0.05}`;
  const marker = `${center.lat},${center.lng}`;
  const radiusSize = getRadiusSize(serviceRadius);

  const timeAgo = (date: string) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  const selectedRequest = selectedPin !== null && sortedRequests[selectedPin] ? sortedRequests[selectedPin] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="glass-card border-border/30 shadow-card overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary-foreground" />
              </div>
              Live Request Map
              {geoLoading && <Locate className="w-3 h-3 text-muted-foreground animate-pulse ml-1" />}
            </CardTitle>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-[10px] flex items-center gap-1">
                <Radar className="w-3 h-3" />
                {serviceRadius} km
              </Badge>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {withinRadiusCount}/{requests.length} in range
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
            {/* Map Section */}
            <div className="lg:col-span-3 relative">
              <div className="relative w-full h-72 lg:h-80">
                <iframe
                  title="Live Map"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`}
                  loading="lazy"
                />
                
                {/* Radius Circle Overlay */}
                <div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary/40 bg-primary/5 pointer-events-none"
                  style={{ 
                    width: `${radiusSize}%`, 
                    height: `${radiusSize}%`,
                    maxWidth: '90%',
                    maxHeight: '90%'
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded">
                    {serviceRadius} km
                  </div>
                </div>
                
                {/* Clickable request pins */}
                <div className="absolute inset-0">
                  {sortedRequests.slice(0, pinPositions.length).map((req, i) => {
                    const originalIndex = requests.findIndex(r => r.id === req.id);
                    const pos = pinPositions[originalIndex] || pinPositions[i];
                    const urgency = urgencyConfig[req.urgency] || urgencyConfig.medium;
                    const isSelected = selectedPin === i;
                    const isWithinRadius = req.withinRadius;

                    return (
                      <motion.button
                        key={req.id}
                        className={`absolute z-10 group cursor-pointer ${!isWithinRadius ? "opacity-40" : ""}`}
                        style={{ top: pos.top, left: pos.left }}
                        initial={{ scale: 0 }}
                        animate={{ scale: isSelected ? 1.4 : 1 }}
                        transition={{ delay: 0.3 + i * 0.1, type: "spring", stiffness: 300 }}
                        onClick={() => setSelectedPin(isSelected ? null : i)}
                        title={`${req.service_type} — ${req.location} (${req.distance.toFixed(1)} km)`}
                      >
                        <span className="relative flex h-5 w-5">
                          {urgency.pulse && isWithinRadius && (
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${urgency.color} opacity-30`} />
                          )}
                          <span className={`relative inline-flex rounded-full h-5 w-5 ${urgency.color} border-2 border-background shadow-lg transition-all ${isSelected ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : "group-hover:scale-125"} ${!isWithinRadius ? "grayscale" : ""}`} />
                        </span>
                        {/* Hover tooltip */}
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[9px] font-semibold px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                          {req.service_type} • {req.distance.toFixed(1)} km
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Selected request popup on map */}
                <AnimatePresence>
                  {selectedRequest && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      className="absolute bottom-14 left-1/2 -translate-x-1/2 w-72 bg-background/95 backdrop-blur-md rounded-xl shadow-xl border border-border/50 p-4 z-20"
                    >
                      <button
                        onClick={() => setSelectedPin(null)}
                        className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted/50 transition-colors"
                      >
                        <X className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>

                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${urgencyConfig[selectedRequest.urgency]?.color || "bg-amber-500"}`}>
                          <MapPin className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-bold text-foreground truncate">
                              {selectedRequest.service_type}
                            </h4>
                            <Badge variant="outline" className="text-[9px] flex-shrink-0">
                              {urgencyConfig[selectedRequest.urgency]?.label || "Medium"}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mb-1">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{selectedRequest.location}</span>
                          </p>
                          <p className="text-[11px] text-muted-foreground line-clamp-2 mb-2">
                            {selectedRequest.concern}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {timeAgo(selectedRequest.created_at)}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-[10px]"
                                onClick={() => window.open(`tel:${selectedRequest.phone}`, "_self")}
                              >
                                <Phone className="w-3 h-3 mr-1" />
                                Call
                              </Button>
                              <Button
                                size="sm"
                                className="h-7 px-2 text-[10px]"
                                onClick={() => navigate(`/chat?with=${selectedRequest.id}`)}
                              >
                                <MessageCircle className="w-3 h-3 mr-1" />
                                Chat
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Legend */}
                <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-border/40">
                  <p className="text-[10px] font-semibold text-foreground mb-1">
                    {userLocation ? "Your Area" : "Pune Area (Default)"}
                  </p>
                  <div className="flex items-center gap-3">
                    {Object.entries(urgencyConfig).map(([key, cfg]) => (
                      <div key={key} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <span className={`w-2 h-2 rounded-full ${cfg.color}`} />
                        {cfg.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Live Request Feed */}
            <div className="lg:col-span-2 border-t lg:border-t-0 lg:border-l border-border/30">
              <div className="px-4 py-3 border-b border-border/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold text-foreground">Incoming Requests</span>
                </div>
                {/* Sort Toggle */}
                <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
                  {(["distance", "time", "urgency"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSortBy(s)}
                      className={`px-2 py-1 text-[10px] font-medium rounded-md transition-all ${
                        sortBy === s
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {s === "distance" ? "📍" : s === "time" ? "🕐" : "⚡"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="max-h-[268px] overflow-y-auto scrollbar-hide">
                {loading ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-16 rounded-lg bg-muted/50 animate-pulse" />
                    ))}
                  </div>
                ) : sortedRequests.length === 0 ? (
                  <div className="p-8 text-center">
                    <MapPin className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No active requests nearby</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">New requests will appear here in real-time</p>
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {sortedRequests.map((req, i) => {
                      const urgency = urgencyConfig[req.urgency] || urgencyConfig.medium;
                      const isSelected = selectedPin === i;
                      const isWithinRadius = req.withinRadius;
                      return (
                        <motion.div
                          key={req.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() => setSelectedPin(isSelected ? null : i)}
                          className={`px-4 py-3 border-b border-border/10 hover:bg-muted/30 transition-all cursor-pointer group ${
                            isSelected ? "bg-primary/5 border-l-2 border-l-primary" : ""
                          } ${!isWithinRadius ? "opacity-50" : ""}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${urgency.color} ${urgency.pulse && isWithinRadius ? "animate-pulse" : ""}`} />
                                <span className="text-xs font-semibold text-foreground truncate">
                                  {req.service_type}
                                </span>
                                {req.urgency === "high" && (
                                  <AlertTriangle className="w-3 h-3 text-destructive flex-shrink-0" />
                                )}
                                {!isWithinRadius && (
                                  <Badge variant="outline" className="text-[8px] px-1 py-0 h-4 text-muted-foreground">
                                    Out of range
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground ml-4">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-2.5 h-2.5" />
                                  <span className="truncate max-w-[100px]">{req.location}</span>
                                </span>
                                <span className="flex items-center gap-1 font-semibold text-primary">
                                  <Radar className="w-2.5 h-2.5" />
                                  {req.distance.toFixed(1)} km
                                </span>
                              </div>
                              {isSelected && (
                                <motion.p
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  className="text-[10px] text-muted-foreground ml-4 mt-1 line-clamp-2"
                                >
                                  {req.concern}
                                </motion.p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <Clock className="w-2.5 h-2.5" />
                                {timeAgo(req.created_at)}
                              </div>
                              <ChevronRight className={`w-3 h-3 transition-all ${isSelected ? "text-primary rotate-90" : "text-muted-foreground/40 group-hover:text-primary"}`} />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LiveRequestMap;
