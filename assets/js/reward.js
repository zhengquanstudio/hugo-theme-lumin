document.addEventListener('DOMContentLoaded', function() {
  const rewardBtn = document.getElementById('reward-toggle-btn');
  const rewardModal = document.getElementById('reward-modal');
  const rewardModalOverlay = document.getElementById('reward-modal-overlay');
  const rewardModalClose = document.getElementById('reward-modal-close');

  if (!rewardBtn || !rewardModal || !rewardModalOverlay || !rewardModalClose) {
    return;
  }

  function openModal() {
    rewardModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
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
});
