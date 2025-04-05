import { sendConnectionAcceptedEmail } from "../emails/emailHandlers.js";
import ConnectionRequest from "../models/connectionRequest.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

// -- SEND CONNECTION REQUEST --
export const sendConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const senderId = req.user._id;
    if (senderId.toString() === userId) {
      return res.status(400).json({
        message: "You cannot send a request to yourself",
      });
    }
    // check if user is already connected
    if (req.user.connections.includes(userId)) {
      return res.status(400).json({
        message: "You already have a connection with this user",
      });
    }
    // check if user has already sent a connection request
    const existingRequest = await ConnectionRequest.findOne({
      sender: senderId,
      recipient: userId,
      status: "pending",
    });
    if (existingRequest) {
      return res.status(400).json({
        message: "You already have a pending connection request",
      });
    }
    // create new connection request
    const newRequest = new ConnectionRequest({
      sender: senderId,
      recipient: userId,
    });
    await newRequest.save();
    res.status(201).json({
      message: "Connection request sent successfully",
    });
    // handle errors
  } catch (error) {
    console.log("error in send connection request controller : ", error);
    res.status(500).json({
      message: "Failed to send connection request",
    });
  }
};

// -- ACCEPT CONNECTION REQUEST --
export const acceptConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;
    const request = await ConnectionRequest.findById(requestId)
      .populate("sender", "name email username")
      .populate("recipient", "name username");
    // check if request exists
    if (!request) {
      return res.status(404).json({ message: "Connection request not found" });
    }
    // check if user is authorized
    if (request.recipient._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You are not authorized" });
    }
    // check if request is pending
    if (request.status !== "pending")
      return res.status(400).json({
        message: "Connection request already accepted or rejected",
      });

    // accept request
    request.status = "accepted";
    await request.save();
    await User.findByIdAndUpdate(userId, {
      $addToSet: { connections: request.sender._id },
    });
    await User.findByIdAndUpdate(request.sender._id, {
      $addToSet: { connections: userId },
    });

    // create notification
    const notification = new Notification({
      recipient: request.sender._id,
      type: "connectionAccepted",
      relatedUser: userId,
    });
    await notification.save();
    res.status(200).json({ message: "Connection accepted" });

    // send email notification
    const senderName = request.sender.name;
    const senderEmail = request.sender.email;
    const recipientName = request.recipient.name;
    const profileUrl = `${process.env.CLIENT_URL}/profile/${request.recipient.username}`;
    try {
      await sendConnectionAcceptedEmail(
        senderName,
        senderEmail,
        recipientName,
        profileUrl
      );
    } catch (error) {
      console.log("error in sending connection accepted email : ", error);
    }
    // handle errors
  } catch (error) {
    console.log("error in accept connection request controller : ", error);
    res.status(500).json({
      message: "Failed to accept connection request",
    });
  }
};

// -- REJECT CONNECTION REQUEST --
export const rejectConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;
    const request = await ConnectionRequest.findById(requestId);
    // check if request exists
    if (!request) {
      return res.status(404).json({ message: "Connection request not found" });
    }
    // check if user is authorized
    if (request.recipient.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You are not authorized" });
    }
    // check if request is pending
    if (request.status !== "pending")
      return res.status(400).json({
        message: "Connection request already accepted or rejected",
      });
    // reject request
    request.status = "rejected";
    await request.save();
    res.status(200).json({ message: "Connection request rejected" });

    // handle errors
  } catch (error) {
    console.log("error in reject connection request controller : ", error);
    res.status(500).json({
      message: "Failed to reject connection request",
    });
  }
};

// -- GET PENDING CONNECTION REQUESTS --
export const getPendingConnectionRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const requests = await ConnectionRequest.find({
      recipient: userId,
      status: "pending",
    }).populate("sender", "name username profilePicture headline connections");
    res.status(200).json({ requests });
  } catch (error) {
    console.log(
      "error in get pending connection requests controller : ",
      error
    );
    res.status(500).json({
      message: "Failed to get pending connection requests",
    });
  }
};

// -- GET ALL CONNECTIONS --
export const getConnections = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate(
      "connections",
      "name username profilePicture headline connections"
    );
    res.status(200).json(user.connections);
  } catch (error) {
    console.log("error in get connections controller : ", error);
    res.status(500).json({
      message: "Failed to get connections",
    });
  }
};

// -- REMOVE CONNECTION --
export const removeConnection = async (req, res) => {
  try {
    const myId = req.user._id;
    const { userId } = req.params;
    await User.findByIdAndUpdate(myId, {
      $pull: { connections: userId },
    });
    await User.findByIdAndUpdate(userId, {
      $pull: { connections: myId },
    });
    res.status(200).json({ message: "Connection removed" });
  } catch (error) {
    console.log("error in remove connection controller : ", error);
    res.status(500).json({
      message: "Failed to remove connection",
    });
  }
};

// -- GET CONNECTION STATUS --
export const getConnectionStatus = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUser = req.user;
    // already connected
    if (currentUser.connections.includes(targetUserId)) {
      return res.status(200).json({ status: "connected" });
    }

    // check if there is a pending request
    const pendingRequest = await ConnectionRequest.findOne({
      $or: [
        { sender: currentUser._id, recipient: targetUserId },
        { sender: targetUserId, recipient: currentUser._id },
      ],
      status: "pending",
    });
    if (pendingRequest) {
      if (pendingRequest.sender.toString() === currentUser._id.toString()) {
        return res.status(200).json({ status: "pending" });
      } else {
        return res.status(200).json({
          status: "received",
          requestId: pendingRequest._id,
        });
      }
    }
    return res.status(200).json({ status: "not_connected" });

    // handle errors
  } catch (error) {
    console.log("error in get connection status controller : ", error);
    return res.status(500).json({
      message: "Failed to get connection status",
    });
  }
};
