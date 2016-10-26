import Client from 'socket.io-client';

import LoginStore from '../stores/LoginStore';
import LoginActions from '../actions/LoginActions';
import LoadingActions from '../actions/LoadingActions';

let instance = null;

class Socket {
	constructor() {
		if (instance) return instance;
		instance = this;

		this.socket = Client();

		return instance;
	}

	on(e, callback) {
		this.socket.on(e, callback);
	}

	login(data) {
		return new Promise((resolve, reject) => {
			LoadingActions.add();
			this.socket.emit('Login', data, (result) => {
				LoadingActions.remove();
				if (result.error) return reject(result.error);
				LoginActions.loginUser(result.jwt);
				resolve(result);
			});
		});
	}

	send(cmd, data) {
		return new Promise((resolve, reject) => {
			if (! LoginStore.isLoggedIn) return reject('Not logged in');
			LoadingActions.add();
			this.socket.emit(cmd, { jwt: LoginStore.jwt, data: data }, (result) => {
				LoadingActions.remove();
				if (result.error === "Invalid token") return LoginActions.logoutUser();
				if (result.error) return reject(result.error);
				resolve(result.data);
			});
		});
	}
}

export default new Socket();
