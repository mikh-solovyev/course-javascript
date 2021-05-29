export default class UserList {
  constructor(root) {
    this.root = root;
    this.users = new Set();

    this.elements = {
      userCount: document.querySelector(`[data-role=user-count]`),
      userTpl: document.querySelector(`#user`),
    };
  }

  createUsersHTML() {
    const tpl = this.elements.userTpl.innerHTML;
    let html = '';

    this.users.forEach((item) => {
      html += tpl.replaceAll('{{user.name}}', item);
    });

    this.root.innerHTML = html;
  }

  refreshCount() {
    const count = this.users.size;
    this.elements.userCount.textContent = `${count} ${this.declOfNum(count, [
      'участник',
      'участника',
      'участников',
    ])}`;
  }

  add(name) {
    this.users.add(name);
    this.createUsersHTML();
    this.refreshCount();
  }

  remove(name) {
    this.users.delete(name);
    this.createUsersHTML();
    this.refreshCount();
  }

  declOfNum(number, words) {
    return words[
      number % 100 > 4 && number % 100 < 20
        ? 2
        : [2, 0, 1, 1, 1, 2][number % 10 < 5 ? number % 10 : 5]
    ];
  }
}
