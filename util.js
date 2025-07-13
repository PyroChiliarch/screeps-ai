module.exports = {

    isValidRoomName: function(roomName) {
        // Match: E or W, then one or more digits, then N or S, then one or more digits
        return /^[EW]\d+[NS]\d+$/.test(roomName);
    }

}