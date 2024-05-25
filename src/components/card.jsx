import React, { useState } from 'react';

const modalStyles = {
  modalContainer: {
    maxHeight: '400px',
    maxWidth: '500px',
    position: 'fixed',
    top: '10px',
    right: '10px',
    backgroundColor: '#fff',
    borderRadius: '16px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 15px 30px 0 rgba(0, 0, 0, 0.25)',
    zIndex: 1000,
  },
  modalContainerHeader: {
    padding: '16px 32px',
    borderBottom: '1px solid #ddd',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalContainerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    lineHeight: '1',
    fontWeight: '700',
    fontSize: '1.125rem',
  },
  modalContainerTitleSvg: {
    width: '32px',
    height: '32px',
    color: '#750550',
  },
  modalContainerBody: {
    padding: '24px 32px 51px',
    overflowY: 'auto',
  },
  modalContainerFooter: {
    padding: '20px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTop: '1px solid #ddd',
    gap: '12px',
    position: 'relative',
  },
  button: {
    padding: '12px 20px',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    border: '0',
    fontWeight: '600',
    cursor: 'pointer',
    transition: '0.15s ease',
  },
  buttonPrimary: {
    backgroundColor: '#750550',
    color: '#fff',
  },
  buttonPrimaryHover: {
    backgroundColor: '#4a0433',
  },
  iconButton: {
    padding: '0',
    border: '0',
    backgroundColor: 'transparent',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: '1',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: '0.15s ease',
  },
  iconButtonHover: {
    backgroundColor: '#dfdad7',
  },
};

const ModalCard = ({ selectedNode, data }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!selectedNode || !isVisible) {
    return null;
  }

  return (
    <div style={modalStyles.modalContainer}>
      <article style={modalStyles.modalContainer}>
        <header style={modalStyles.modalContainerHeader}>
          <span style={modalStyles.modalContainerTitle}>
            <svg aria-hidden="true" height="24" width="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={modalStyles.modalContainerTitleSvg}>
              <path d="M0 0h24v24H0z" fill="none"></path>
              <path d="M14 9V4H5v16h6.056c.328.417.724.785 1.18 1.085l1.39.915H3.993A.993.993 0 0 1 3 21.008V2.992C3 2.455 3.449 2 4.002 2h10.995L21 8v1h-7zm-2 2h9v5.949c0 .99-.501 1.916-1.336 2.465L16.5 21.498l-3.164-2.084A2.953 2.953 0 0 1 12 16.95V11zm2 5.949c0 .316.162.614.436.795l2.064 1.36 2.064-1.36a.954.954 0 0 0 .436-.795V13h-5v3.949z" fill="currentColor"></path>
            </svg>
            {data[selectedNode].title}
          </span>
          <button style={modalStyles.iconButton} onClick={() => setIsVisible(false)}>
            <svg height="24" width="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0h24v24H0z" fill="none"></path>
              <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" fill="currentColor"></path>
            </svg>
          </button>
        </header>
        <section style={modalStyles.modalContainerBody}>
          <p>{data[selectedNode].data}</p>
        </section>
        <footer style={modalStyles.modalContainerFooter}>
          <a href="https://dummy-link.com" style={{ ...modalStyles.button, ...modalStyles.buttonPrimary }}>Know More</a>
        </footer>
      </article>
    </div>
  );
};

export default ModalCard;
