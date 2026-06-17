// ModalRequisicao.styles.ts

export const modalStyles = `
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(4px);
    z-index: 10005;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeIn 0.15s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .modal-card {
    background: #fff;
    border-radius: 24px;
    width: 100%;
    max-width: 560px;
    max-height: 92vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    color: #0f172a;
    box-shadow: 0 32px 64px rgba(0,0,0,0.18);
    animation: slideUp 0.2s ease;
  }

  /* ── Header ── */
  .modal-header {
    padding: 24px 28px 20px;
    border-bottom: 1px solid #f1f5f9;
  }

  .modal-header-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
  }

  .modal-title {
    font-size: 17px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
    letter-spacing: -0.3px;
  }

  .modal-subtitle {
    font-size: 13px;
    color: #64748b;
    margin: 3px 0 0;
  }

  .modal-close-btn {
    background: #f1f5f9;
    border: none;
    border-radius: 50%;
    width: 34px;
    height: 34px;
    font-size: 18px;
    line-height: 34px;
    text-align: center;
    cursor: pointer;
    color: #64748b;
    flex-shrink: 0;
    transition: background 0.15s;
  }

  .modal-close-btn:hover { background: #e2e8f0; }

  /* ── Steps ── */
  .steps-row {
    display: flex;
    align-items: center;
    gap: 0;
  }

  .step-item {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
  }

  .step-item:not(:last-child)::after {
    content: '';
    flex: 1;
    height: 2px;
    background: #e2e8f0;
    margin: 0 8px;
    border-radius: 1px;
    transition: background 0.3s;
  }

  .step-item.done:not(:last-child)::after {
    background: #2563eb;
  }

  .step-dot {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;
    transition: all 0.2s;
  }

  .step-dot.active {
    background: #2563eb;
    color: #fff;
    box-shadow: 0 0 0 4px #dbeafe;
  }

  .step-dot.done {
    background: #2563eb;
    color: #fff;
  }

  .step-dot.pending {
    background: #f1f5f9;
    color: #94a3b8;
  }

  .step-label {
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
  }

  .step-label.active { color: #2563eb; }
  .step-label.done   { color: #2563eb; }
  .step-label.pending { color: #94a3b8; }

  /* ── Body ── */
  .modal-body {
    padding: 24px 28px;
    flex: 1;
    overflow-y: auto;
  }

  .section-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #94a3b8;
    margin: 0 0 12px;
  }

  .fields-grid {
    display: grid;
    gap: 10px;
    margin-bottom: 20px;
  }

  .fields-grid-2 {
    grid-template-columns: 1fr 1fr;
  }

  .field-wrap {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .field-label {
    font-size: 12px;
    font-weight: 600;
    color: #475569;
  }

  .field-input {
    padding: 10px 13px;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    font-size: 14px;
    color: #0f172a;
    background: #fff;
    transition: border-color 0.15s, box-shadow 0.15s;
    outline: none;
    width: 100%;
    box-sizing: border-box;
  }

  .field-input:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px #dbeafe;
  }

  .field-input::placeholder { color: #cbd5e1; }

  /* ── Divider ── */
  .section-divider {
    height: 1px;
    background: #f1f5f9;
    margin: 4px 0 20px;
  }

  /* ── Review card ── */
  .review-block {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 16px;
    margin-bottom: 16px;
  }

  .review-block-title {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: #94a3b8;
    margin: 0 0 12px;
  }

  .review-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    border-bottom: 1px solid #f1f5f9;
    font-size: 14px;
  }

  .review-row:last-child { border-bottom: none; }

  .review-row-key {
    color: #64748b;
    font-weight: 500;
  }

  .review-row-val {
    color: #0f172a;
    font-weight: 600;
    text-align: right;
    max-width: 60%;
  }

  .items-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .item-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    color: #1e293b;
  }

  .item-pill-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #2563eb;
    flex-shrink: 0;
  }

  /* ── Footer ── */
  .modal-footer {
    padding: 16px 28px;
    border-top: 1px solid #f1f5f9;
    display: flex;
    gap: 10px;
  }

  .btn {
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    padding: 13px 20px;
    transition: all 0.15s;
  }

  .btn-secondary {
    flex: 1;
    background: #f1f5f9;
    color: #475569;
  }

  .btn-secondary:hover { background: #e2e8f0; }

  .btn-primary {
    flex: 2;
    background: #2563eb;
    color: #fff;
  }

  .btn-primary:hover { background: #1d4ed8; }

  .btn-success {
    flex: 2;
    background: #16a34a;
    color: #fff;
  }

  .btn-success:hover { background: #15803d; }
  .btn-success:disabled { background: #94a3b8; cursor: not-allowed; }

  .btn-loading {
    opacity: 0.75;
    cursor: not-allowed;
  }
`;