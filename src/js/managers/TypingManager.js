import { findNextTarget, normalizeTypedKey } from '../gameRules.js';

export class TypingManager {
  constructor(game) {
    this.game = game;
    this.targetLetter = '';
    this.currentBox = null;
    this.isResolving = false;
    this.targetDisplay = document.getElementById('target-word');
    this.mobileInput = document.getElementById('mobile-input');
    this.typingUI = document.getElementById('typing-ui');

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onInput = this.onInput.bind(this);
    this.focusInput = this.focusInput.bind(this);

    window.addEventListener('keydown', this.onKeyDown);
    this.mobileInput?.addEventListener('input', this.onInput);
    this.typingUI?.addEventListener('pointerdown', this.focusInput);
    this.updateTargetLetter();
  }

  focusInput() {
    this.mobileInput?.focus({ preventScroll: true });
  }

  onInput(event) {
    const value = event.target.value;
    const key = value.slice(-1);
    event.target.value = '';
    this.handleTyping(normalizeTypedKey(key));
  }

  onKeyDown(event) {
    if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;
    const typed = normalizeTypedKey(event.key);
    if (!typed) return;
    event.preventDefault();
    this.handleTyping(typed);
  }

  handleTyping(typed) {
    if (!this.game.hasStarted || !typed || !this.currentBox || this.isResolving || this.game.isGameOver) return;

    if (typed !== this.targetLetter) {
      this.game.uiManager.showTypingFeedback('miss', typed);
      return;
    }

    const target = this.currentBox;
    const distance = target.box.position.x - this.game.player.mesh.position.x;
    if (distance <= 0 || distance > 15.1) {
      this.updateTargetLetter();
      return;
    }

    this.isResolving = true;
    this.game.isTypingCorrect = true;
    target.completed = true;
    this.game.score += 100;
    this.game.uiManager.updateScore(this.game.score);
    this.game.uiManager.showTypingFeedback('hit', typed);
    this.game.updateDifficulty();

    const startX = this.game.player.mesh.position.x;
    const targetX = target.box.position.x;
    const advance = targetX - startX;
    const dashX = Math.min(targetX, startX + 3.2);
    const startedAt = performance.now();
    const duration = 260;

    const move = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.game.player.mesh.position.x = startX + (dashX - startX) * eased;

      if (progress < 1) {
        requestAnimationFrame(move);
        return;
      }

      this.game.boxes.forEach(({ box, letter }) => {
        box.position.x -= advance;
        letter.position.x -= advance;
      });
      this.game.player.mesh.position.x = startX;
      this.game.player.jumpAndBreak(target);
      this.game.isTypingCorrect = false;
      this.isResolving = false;
      this.currentBox = null;
      this.targetLetter = '';
      this.updateTargetLetter();
    };

    requestAnimationFrame(move);
  }

  updateTargetLetter() {
    if (this.isResolving || !this.game.player) return;
    const nextBox = findNextTarget(this.game.boxes, this.game.player.mesh.position.x);
    this.currentBox = nextBox;
    this.targetLetter = nextBox?.character ?? '';
    this.game.uiManager.setTarget(this.targetLetter);
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    this.mobileInput?.removeEventListener('input', this.onInput);
    this.typingUI?.removeEventListener('pointerdown', this.focusInput);
  }
}
