const axios = require('axios');

/**
 * Daily.co API Service
 * Handles room creation, deletion, and meeting token generation
 */
class DailyService {
  constructor() {
    this.apiKey = process.env.DAILY_API_KEY;
    this.domain = process.env.DAILY_DOMAIN || 'go-tutor.daily.co';
    this.baseUrl = 'https://api.daily.co/v1';
    
    // Check if API key is configured
    if (!this.apiKey) {
      console.warn('⚠️  DAILY_API_KEY not configured. Video sessions will not work.');
      this.enabled = false;
    } else {
      this.enabled = true;
      console.log(`✓ Daily.co service initialized (domain: ${this.domain})`);
    }
  }

  /**
   * Create a Daily.co room for a tutoring session
   * @param {string} sessionId - The session ID
   * @param {number} durationMinutes - Session duration in minutes
   * @returns {Promise<{url: string, name: string}>} Room URL and name
   */
  async createRoom(sessionId, durationMinutes = 60) {
    if (!this.enabled) {
      throw new Error('Daily.co API key not configured');
    }

    try {
      const roomName = `session-${sessionId}`;
      const expiresAt = Math.floor(Date.now() / 1000) + (durationMinutes * 60) + 600; // +10 min buffer

      const { data } = await axios.post(
        `${this.baseUrl}/rooms`,
        {
          name: roomName,
          privacy: 'private', // Only people with link can join
          properties: {
            max_participants: 2, // Tutor + Student
            enable_chat: false, // We use our own chat
            enable_screenshare: true,
            enable_recording: 'cloud', // Optional: can record sessions
            enable_knocking: false, // No waiting room
            enable_prejoin_ui: false, // Skip pre-join UI
            start_video_off: false,
            start_audio_off: false,
            owner_only_broadcast: false, // Both can share video
            exp: expiresAt, // Auto-delete room after session
            eject_at_room_exp: true, // Kick users when room expires
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`✓ Created Daily.co room: ${roomName}`);
      
      return {
        url: data.url,
        name: data.name,
      };
    } catch (error) {
      console.error('Error creating Daily.co room:', error.response?.data || error.message);
      throw new Error(`Failed to create video room: ${error.message}`);
    }
  }

  /**
   * Delete a Daily.co room (cleanup after session)
   * @param {string} roomName - The room name to delete
   */
  async deleteRoom(roomName) {
    if (!this.enabled) {
      return; // Silent fail if not configured
    }

    try {
      await axios.delete(
        `${this.baseUrl}/rooms/${roomName}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      console.log(`✓ Deleted Daily.co room: ${roomName}`);
    } catch (error) {
      // Don't throw - room might already be expired/deleted
      console.warn(`Could not delete room ${roomName}:`, error.response?.data?.info || error.message);
    }
  }

  /**
   * Generate a meeting token for secure room access
   * @param {string} roomName - The room name
   * @param {string} userName - The user's display name
   * @param {boolean} isOwner - Whether user is room owner (moderator)
   * @returns {Promise<string>} Meeting token
   */
  async getMeetingToken(roomName, userName, isOwner = false) {
    if (!this.enabled) {
      throw new Error('Daily.co API key not configured');
    }

    try {
      const { data } = await axios.post(
        `${this.baseUrl}/meeting-tokens`,
        {
          properties: {
            room_name: roomName,
            user_name: userName,
            is_owner: isOwner,
            enable_screenshare: true,
            enable_recording: 'cloud',
            start_video_off: false,
            start_audio_off: false,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return data.token;
    } catch (error) {
      console.error('Error generating meeting token:', error.response?.data || error.message);
      throw new Error(`Failed to generate meeting token: ${error.message}`);
    }
  }

  /**
   * Get room info
   * @param {string} roomName - The room name
   * @returns {Promise<object>} Room information
   */
  async getRoomInfo(roomName) {
    if (!this.enabled) {
      throw new Error('Daily.co API key not configured');
    }

    try {
      const { data } = await axios.get(
        `${this.baseUrl}/rooms/${roomName}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      return data;
    } catch (error) {
      console.error('Error fetching room info:', error.response?.data || error.message);
      throw new Error(`Failed to fetch room info: ${error.message}`);
    }
  }
}

module.exports = new DailyService();

