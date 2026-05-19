document.addEventListener('DOMContentLoaded', function() {
  console.log('[Reward] Loading reward module...');
  
  const rewardBtn = document.getElementById('reward-toggle-btn');
  const rewardModal = document.getElementById('reward-modal');
  const rewardModalOverlay = document.getElementById('reward-modal-overlay');
  const rewardModalClose = document.getElementById('reward-modal-close');

  console.log('[Reward] Elements:', {
    button: rewardBtn,
    modal: rewardModal,
    overlay: rewardModalOverlay,
    closeBtn: rewardModalClose
  });

  if (!rewardBtn || !rewardModal || !rewardModalOverlay || !rewardModalClose) {
    console.warn('[Reward] Some elements are missing');
    return;
  }

  function openModal() {
    console.log('[Reward] Opening modal');
    rewardModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    console.log('[Reward] Closing modal');
    rewardModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  rewardBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    openModal();
  });

  rewardModalOverlay.addEventListener('click', function(e) {
    e.preventDefault();
    closeModal();
  });

  rewardModalClose.addEventListener('click', function(e) {
    e.preventDefault();
    closeModal();
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && rewardModal.classList.contains('active')) {
      closeModal();
    }
  });

  console.log('[Reward] Module initialized successfully');
});
