const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const ServiceProvider = require('../models/ServiceProvider');
const Profile = require('../models/Profile');

// GET /api/conversations  - user's conversations
router.get('/', protect, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      $or: [{ customerId: req.user.id }, { providerId: req.user.id }],
    }).sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/conversations  - find or create conversation
router.post('/', protect, async (req, res) => {
  const { targetUserId } = req.body;
  if (!targetUserId) return res.status(400).json({ message: 'targetUserId required' });

  try {
    let conversation = await Conversation.findOne({
      $or: [
        { customerId: req.user.id, providerId: targetUserId },
        { customerId: targetUserId, providerId: req.user.id },
      ],
    });

    if (!conversation) {
      conversation = await Conversation.create({
        customerId: req.user.id,
        providerId: targetUserId,
      });
    }

    res.json(conversation);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/conversations/:id/messages
router.get('/:id/messages', protect, async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.id }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/conversations/:id/messages  - send a message
router.post('/:id/messages', protect, async (req, res) => {
  const { content, imageUrl, messageType, isAuto } = req.body;
  if (!content && !imageUrl) return res.status(400).json({ message: 'content or imageUrl required' });

  try {
    const message = await Message.create({
      conversationId: req.params.id,
      senderId: req.user.id,
      content: content || null,
      imageUrl: imageUrl || null,
      messageType: imageUrl ? 'image' : (messageType || 'text'),
      isAuto: isAuto || false,
    });

    // Update conversation timestamp
    await Conversation.findByIdAndUpdate(req.params.id, { updatedAt: new Date() });

    // Emit real-time event via Socket.io
    const io = req.app.get('io');
    if (io) {
      const msgObj = {
        id: message._id.toString(),
        conversation_id: message.conversationId.toString(),
        sender_id: message.senderId.toString(),
        content: message.content,
        image_url: message.imageUrl,
        message_type: message.messageType,
        is_auto: message.isAuto,
        read_at: message.readAt,
        created_at: message.createdAt,
      };
      io.to(req.params.id).emit('new_message', msgObj);
    }

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/conversations/:id/messages/read  - mark messages as read
router.patch('/:id/messages/read', protect, async (req, res) => {
  try {
    await Message.updateMany(
      { conversationId: req.params.id, senderId: { $ne: req.user.id }, readAt: null },
      { readAt: new Date() }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/conversations/user/:userId/name  - get display name of a user
router.get('/user/:userId/name', protect, async (req, res) => {
  try {
    const provider = await ServiceProvider.findOne({ userId: req.params.userId });
    if (provider) return res.json({ name: provider.fullName });

    const profile = await Profile.findOne({ userId: req.params.userId });
    if (profile) return res.json({ name: profile.fullName });

    res.json({ name: 'Unknown' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
