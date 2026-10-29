export function createFeedback({ root, t }) {
  const status = root.querySelector('[data-feedback-status]');
  const alert = root.querySelector('[data-feedback-alert]');
  const retryButton = root.querySelector('[data-feedback-retry]');
  const closeButton = root.querySelector('[data-feedback-close]');
  let current = null;
  let origin = null;

  function render() {
    root.hidden = !current;
    if (!current) { status.textContent = ''; alert.textContent = ''; return; }
    const error = current.tone === 'error';
    root.dataset.tone = current.tone;
    status.textContent = error ? '' : t(current.key);
    alert.textContent = error ? t(current.key) : '';
    const retryHadFocus = document.activeElement === retryButton;
    retryButton.hidden = !current.retry;
    retryButton.textContent = t('stateRetry');
    closeButton.setAttribute('aria-label', t('stateDismiss'));
    if (retryHadFocus && !current.retry) closeButton.focus({ preventScroll: true });
  }

  function dismiss() {
    const restore = root.contains(document.activeElement);
    current = null;
    render();
    if (restore && origin?.isConnected && !origin.disabled) origin.focus({ preventScroll: true });
  }
  retryButton.addEventListener('click', () => current?.retry?.());
  closeButton.addEventListener('click', dismiss);
  return {
    render, dismiss,
    show(key, { tone = 'info', retry } = {}) {
      if (!root.contains(document.activeElement)) origin = document.activeElement;
      current = { key, tone, retry };
      render();
    },
  };
}

// A download click is observable; the browser's eventual file save is not.
export function createDownloadManager({ feedback }) {
  let busy = false;
  async function run(job) {
    if (busy) return false;
    busy = true;
    const button = job.button;
    const wasDisabled = button?.disabled;
    if (button) {
      button.dataset.downloadBusy = 'true';
      button.disabled = true;
      button.setAttribute('aria-busy', 'true');
    }
    let url;
    let link;
    let started = false;
    feedback.show('statePreparingDownload');
    try {
      const content = typeof job.content === 'function' ? await job.content() : job.content;
      const blob = new Blob([content], { type: job.type });
      url = URL.createObjectURL(blob);
      link = document.createElement('a');
      link.href = url;
      link.download = job.filename;
      document.body.append(link);
      link.click();
      started = true;
    } catch {
      // The UI uses a recoverable message; contact or research data is never logged.
    } finally {
      link?.remove();
      if (url) setTimeout(() => URL.revokeObjectURL(url), 1000);
      busy = false;
      if (button) {
        delete button.dataset.downloadBusy;
        button.disabled = button.dataset.disabledByState === undefined ? wasDisabled : button.dataset.disabledByState === 'true';
        button.removeAttribute('aria-busy');
      }
    }
    feedback.show(started ? job.successKey || 'stateDownloadStarted' : 'stateDownloadFailed', started ? {} : { tone: 'error', retry: () => run(job) });
    return started;
  }
  return { run };
}

export const outcomeStates = {
  active: { tone: 'success', icon: '✓', key: 'outcomeActive' },
  negative: { tone: 'neutral', icon: '−', key: 'outcomeNegative' },
  unexpressed: { tone: 'neutral', icon: '○', key: 'outcomeUnexpressed' },
  flagged: { tone: 'warning', icon: '!', key: 'outcomeFlagged' },
};

export function createOutcomeBadge(outcome, t) {
  const state = outcomeStates[outcome];
  const badge = document.createElement('span');
  badge.className = 'state-badge';
  badge.dataset.tone = state.tone;
  const icon = document.createElement('span');
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = state.icon;
  badge.append(icon, document.createTextNode(t(state.key)));
  return badge;
}
