const helpers = {
  // Generate random string
  generateRandomString: (length = 10) => {
    return Math.random().toString(36).substring(2, length + 2);
  },

  // Generate unique slug
  generateSlug: (text) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  // Format price
  formatPrice: (price, currency = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
    }).format(price);
  },

  // Calculate distance between two coordinates
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  // Check if coordinates are within radius
  isWithinRadius: (lat1, lon1, lat2, lon2, radiusKm) => {
    const distance = this.calculateDistance(lat1, lon1, lat2, lon2);
    return distance <= radiusKm;
  },

  // Get initials from name
  getInitials: (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  },

  // Format phone number
  formatPhoneNumber: (phone) => {
    // Exemple pour format français
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+33${cleaned.substring(1)}`;
    }
    return `+${cleaned}`;
  },

  // Get remaining time until date
  getTimeRemaining: (targetDate) => {
    const now = new Date();
    const diff = targetDate - now;

    if (diff < 0) return 'Expiré';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}j ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  },
};

module.exports = helpers;
