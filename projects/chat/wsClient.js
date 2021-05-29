export default class WSClient {
  constructor(url, onMessage) {
    this.url = url;
    this.onMessage = onMessage;
  }

  /**
   * Подключение к сокет серверу
   * @returns {Promise<unknown>}
   */
  connect() {
    return new Promise((resolve) => {
      this.socket = new WebSocket(this.url);
      this.socket.addEventListener('open', resolve);
      this.socket.addEventListener('message', (e) => {
        this.onMessage(JSON.parse(e.data));
      });
    });
  }

  /**
   * Отправка данных на сокет сервер
   * @param action
   * @param data
   */
  sendMessage(action, data) {
    this.socket.send(JSON.stringify({ action, data }));
  }

  /**
   * Отключение от сокет сервера
   */
  disconnect() {
    this.socket.close();
  }
}
