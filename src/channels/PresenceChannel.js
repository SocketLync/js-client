import Channel from './Channel';

class PresenceChannel extends Channel {
	here(callback) {
		this.on('subscribed', callback);

		return this;
	}

	joined(callback) {
		this.on('member_joined', callback);

		return this;
	}

	leaved(callback) {
		this.on('member_leaved', callback);

		return this;
	}
}

export default PresenceChannel;