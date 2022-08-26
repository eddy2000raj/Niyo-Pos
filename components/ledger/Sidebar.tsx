import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

function Sidebar({ items, toggle, onToggle, onApply }) {
  const [filters, setFilters] = useState(items);

  useEffect(() => {
    setFilters(items);
  }, [items]);

  const onFilterChange = key => {
    const settings = { ...filters };
    settings[key] = { ...settings[key], enabled: !settings[key].enabled };
    setFilters(settings);
  };

  return (
    <SideBar toggle={toggle}>
      <div className="close-btn" onClick={() => onToggle(false)}>
        <i
          style={{ color: '#fff' }}
          className="fa fa-times fa-sm"
          aria-hidden="true"
        ></i>
      </div>
      {Object.keys(filters).map(val => (
        <div className="menu-items" key={val}>
          <label className="setting-container">
            <span>{filters[val].name}</span>
            <input
              type="checkbox"
              name={filters[val].key}
              value={filters[val].key}
              checked={filters[val].enabled}
              onChange={() => onFilterChange(val)}
            />
            <span className="checkmark"></span>
          </label>
        </div>
      ))}
      <button className="apply-btn" onClick={() => onApply(filters)}>
        Apply
      </button>
    </SideBar>
  );
}

const SideBar = styled.div`
  height: 100%;
  width: ${props => (props.toggle ? '250px' : '0px')};
  position: fixed;
  z-index: 1;
  top: 0;
  right: 0;
  background-color: #111;
  overflow-x: hidden;
  transition: 0.5s;
  padding-top: 60px;

  .close-btn {
    position: absolute;
    top: 0;
    left: 0;
    font-size: 30px;
    margin-left: 15px;
    cursor: pointer;
  }

  .menu-items {
    padding-left: 20px;
    color: #818181;

    /* The container */
    .setting-container {
      display: block;
      position: relative;
      padding-left: 26px;
      margin-bottom: 12px;
      cursor: pointer;
      font-size: 16px;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }

    /* Hide the browser's default checkbox */
    .setting-container input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      height: 0;
      width: 0;
    }

    /* Create a custom checkbox */
    .checkmark {
      position: absolute;
      top: 4px;
      left: 0;
      height: 16px;
      width: 16px;
      background-color: #eee;
    }

    /* On mouse-over, add a grey background color */
    .setting-container:hover input ~ .checkmark {
      background-color: #ccc;
    }

    /* When the checkbox is checked, add a blue background */
    .setting-container input:checked ~ .checkmark {
      background-color: #2196f3;
    }

    /* Create the checkmark/indicator (hidden when not checked) */
    .checkmark:after {
      content: '';
      position: absolute;
      display: none;
    }

    /* Show the checkmark when checked */
    .setting-container input:checked ~ .checkmark:after {
      display: block;
    }

    /* Style the checkmark/indicator */
    .setting-container .checkmark:after {
      left: 7px;
      top: 3px;
      width: 5px;
      height: 10px;
      border: solid white;
      border-width: 0 3px 3px 0;
      -webkit-transform: rotate(45deg);
      -ms-transform: rotate(45deg);
      transform: rotate(45deg);
    }
  }

  .apply-btn {
    margin: 15px;
    width: 90%;
    cursor: pointer;
  }
`;

export default Sidebar;
