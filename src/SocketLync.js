import Channel from './channels/Channel';
import PresenceChannel from './channels/PresenceChannel';
import PrivateChannel from './channels/PrivateChannel';

class SocketLync {
	constructor(options) {
		this.options = options;
		this.channels = {};
		this.socket = null;
		this.connect();

		if (!this.options.withoutInterceptors) {
			this.registerInterceptors();
		}
	}

	connect() {
		if (this.socket) {
			// TODO check if connected, otherwise connect

			return this.socket;
		}

		const io = this.getSocketIO();
		this.socket = io(this.options.host, this.options);

		// on reconnect, subscribe channels again.
		this.socket.on('reconnect', () => {
			Object.values(this.channels).forEach((channel) => channel.subscribe());
		});

		this.socket.on('push:subscription_succeeded', (data) => {
			if (this.channels[data.channel]) {
				this.channels[data.channel].emit('subscribed', data.presence || null);
			}
		});
		this.socket.on('push:message', (event) => {
			if (this.channels[event.channel]) {
				this.channels[event.channel].emit('event:' + event.event, event.data);
			}
		});

		return this.socket;
	}

	getSocketIO() {
		if (typeof this.options.client !== 'undefined') {
			return this.options.client;
		}

		if (typeof io !== 'undefined') {
			return io;
		}

		throw new Error('socket.io-client not found. Should be globally available or passed via options.client');
	}

	async subscribe(name, requireAuth = false) {
		this.connect();

		if (!this.socket || !this.socket.id) {
			return;
		}

		let event = {
			data: {
				channel: name,
			},
		};

		if (requireAuth && (this.options.axios || typeof this.options.authorize === 'function')) {
			const { data } = await (this.options.authorize ? this.options.authorize(this.socketId(), name) : this.options.axios.post('/broadcasting/auth/', {
				socket_id: this.socketId(),
				channel_name: name,
			}));

			event.data.auth = data.auth;

			if (data.channel_data) {
				event.data.channel_data = data.channel_data;
			}
		}

		this.socket.emit('push:subscribe', event);
	}

	unsubscribe(name) {
		this.socket?.emit('push:unsubscribe', {
			data: {
				channel: name,
			},
		});
	}

	registerInterceptors() {
		if (typeof axios === 'function' || typeof this.options.axios === 'function') {
			this.registerAxiosRequestInterceptor();
		}
	}

	registerAxiosRequestInterceptor() {
		(this.options.axios || axios).interceptors.request.use((config) => {
			if (this.socketId()) {
				config.headers['X-Socket-Id'] = this.socketId();
			}

			return config;
		});
	}

	/**
	 * Get a channel instance by name
	 */
	channel(name) {
		if (!this.channels[name]) {
			this.channels[name] = new Channel(this, name);
		}

		return this.channels[name];
	}

	/**
	 * Get a private channel instance by name
	 */
	privateChannel(name) {
		let channel = 'private-' + name;
		if (!this.channels[channel]) {
			this.channels[channel] = new PrivateChannel(this, channel);
		}

		return this.channels[channel];
	}

	/**
	 * Get a presence channel instance by name
	 */
	presenceChannel(name) {
		let channel = 'presence-' + name;
		if (!this.channels[channel]) {
			this.channels[channel] = new PresenceChannel(this, channel);
		}

		return this.channels[channel];
	}

	leave(name) {
		[name, 'private-' + name, 'presence-' + name].forEach((channel) => this.leaveChannel(channel));
	}

	leaveChannel(name) {
		if (this.channels[name]) {
			this.channels[name].unsubscribe();
			delete this.channels[name];
		}
	}

	socketId() {
		return this.socket.id;
	}

	disconnect() {
		this.socket.disconnect();
	}
}

export default SocketLync;