class Channel {
	constructor(socketLync, channel) {
		this.socketLync = socketLync;
		this.name = channel;
		this.listeners = {};
		this.events = {};

		this.subscribe();
	}

	async subscribe() {
		this.socketLync.subscribe(this.name);
	}

	unsubscribe() {
		this.unbind();
		this.socketLync.unsubscribe(this.name);
	}

	listen(event, callback) {
		this.on('event:' + event, callback);

		return this;
	}

	listenToAll(callback) {
		this.on('event:*', callback);

		return this;
	}

	stopListening(event, callback) {
		this.unbindEvent(event, callback);

		return this;
	}

	stopListeningToAll(callback) {
		this.unbind(callback);

		return this;
	}

	subscribed(callback) {
		this.on('subscribed', callback);

		return this;
	}

	emit(event, data) {
		this.events[event]?.(data);

		return this;
	}

	unbind(callback) {
		Object.keys(this.events).forEach((event) => this.unbindEvent(event, callback));

		return this;
	}

	unbindEvent(event, callback) {
		this.listeners[event] = this.listeners[event] || [];

		if (callback) {
			this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
		}

		if (!callback || this.listeners[event].length === 0) {
			if (this.events[event]) {
				delete this.events[event];
			}

			delete this.listeners[event];
		}
	}

	on(event, callback) {
		this.listeners[event] = this.listeners[event] || [];

		if (!this.events[event]) {
			this.events[event] = (data) => {
				if (this.listeners[event]) {
					for (const cb of this.listeners[event]) {
						cb(data);
					}
				}
			};
		}

		this.listeners[event].push(callback);

		return this;
	}
}

export default Channel;