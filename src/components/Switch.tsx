// components/Switch.js
import React from 'react';
import styled from 'styled-components';

const Switch = ({ checked, onChange }) => (
  <StyledWrapper>
    <div className="container">
      <input
        type="checkbox"
        id="checkbox"
        checked={checked}
        onChange={onChange}
      />
      <label htmlFor="checkbox" className="label"></label>
    </div>
  </StyledWrapper>
);

const StyledWrapper = styled.div`
  .container {}

  .label {
    height: 24px;
    width: 42px;
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: inset 0 0 3px 2px #fff,
      inset 0 0 8px 1px rgba(0,0,0,0.22), 4px 8px 12px rgba(0,0,0,0.10),
      inset 0 0 0 2px rgba(0,0,0,0.18);
    display: flex;
    align-items: center;
    cursor: pointer;
    position: relative;
    transition: transform 0.3s;
  }

  .label:hover {
    transform: perspective(80px) rotateX(2deg) rotateY(-2deg);
  }

  #checkbox:checked ~ .label:hover {
    transform: perspective(80px) rotateX(-2deg) rotateY(2deg);
  }

  #checkbox {
    display: none;
  }

  .label::before {
    position: absolute;
    content: "";
    height: 12px;
    width: 12px;
    border-radius: 50%;
    background: linear-gradient(
      130deg,
      #757272 10%,
      #fff 11%,
      #726f6f 62%
    );
    left: 6px;
    top: 6px;
    box-shadow: 0 1px 1px rgba(0,0,0,0.23), 4px 4px 6px rgba(0,0,0,0.23);
    transition: 0.3s;
  }

  #checkbox:checked ~ .label::before {
    left: 24px;
    background: linear-gradient(315deg, #000 0%, #414141 70%);
    transition: 0.3s;
  }
`;


export default Switch;
