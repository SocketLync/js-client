## Installation

```bash
$ npm install @socket-lync/js-client
```

## Usage

Example:

```js
import SocketLync from '@socket-lync/js-client';

const socketLync = new SocketLync({
	client: io,
	socketOptions: {
		host: 'wss://ws.derpierre65.dev/app/APP-ID',
		reconnection: true,
		reconnectionDelayMax: 2_500,
		timeout: 10_000,
	},
});

socketLync.privateChannel('MyPrivateChannel.1312')
	.subscribed(() => console.log('PrivateChannel subscribed'))
	.listen('Notification', () => console.log('New Notification (private)'));

socketLync.channel('MyPublicChannel.1337')
          .subscribed(() => console.log('Channel subscribed'))
          .listen('Notification', () => console.log('New Notification (public)'));

socketLync.presenceChannel('MyPresenceChannel.42')
          .here((members) => console.log('PresenceChannel subscribed, members:', members))
          .listen('Notification', () => console.log('New Notification (presence)'));
```