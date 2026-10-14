import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { cleanText, removeExtraSpaces, textStats } from '../tools/text';
import { lowerCase, titleCase, upperCase } from '../tools/case';
import { TOOLS_BY_ID } from '../tools/registry';
import HoverInfo from './HoverInfo';

export default function TextForm(props) {
  const [text, setText] = useState('');

  const apply = (transform, message) => {
    setText(transform(text));
    props.showAlert(message, 'success');
  };

  const handleClearClick = () => {
    setText('');
    props.showAlert('Text cleared!', 'success');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    props.showAlert('Copied to clipboard', 'success');
  };

  const handleOnChange = (event) => {
    setText(event.target.value);
  };

  const actions = [
    { label: 'Convert to Uppercase', toolId: 'upper', run: () => apply(upperCase, 'Converted to Uppercase!') },
    { label: 'Convert to Lowercase', toolId: 'lower', run: () => apply(lowerCase, 'Converted to Lowercase!') },
    { label: 'Convert to Title Case', toolId: 'title', run: () => apply(titleCase, 'Converted to Title Case!') },
    { label: 'Remove Extra Spaces', toolId: 'remove-extra-spaces', run: () => apply(removeExtraSpaces, 'Extra spaces removed!') },
    { label: 'Clean Text', toolId: 'clean-text', run: () => apply(cleanText, 'Blank and duplicate lines removed, spaces tidied!') },
    { label: 'Copy Text', run: handleCopy },
    { label: 'Clear', run: handleClearClick },
  ];

  const renderAction = (action) => {
    const button = (
      <button key={action.label} disabled={text.length === 0} className="btn btn-primary" onClick={action.run}>
        {action.label}
      </button>
    );
    const tool = TOOLS_BY_ID[action.toolId];
    if (!tool) return button;
    return (
      <HoverInfo key={action.label} title={action.label} description={tool.description} docId={`tool-${tool.id}`}>
        {button}
      </HoverInfo>
    );
  };

  const stats = textStats(text);

  return (
    <>
      <div className="container">
        <h2 className="mb-4">{props.heading}</h2>
        <div className="mb-3">
          <textarea
            className="form-control"
            value={text}
            onChange={handleOnChange}
            style={{
              backgroundColor: props.mode === 'dark' ? 'rgb(36 74 104)' : 'white',
              color: props.mode === 'dark' ? 'white' : 'black',
            }}
            rows="8"
            id="myBox"
            aria-label="Your text"
          ></textarea>
        </div>
        <div className="tu-home-actions">
          {actions.map(renderAction)}
          <Link to="/tools" className="btn btn-outline-primary">
            More tools →
          </Link>
        </div>
      </div>
      <div className="container my-4">
        <h2>Your Text Summary</h2>
        <p>
          {stats.words} words and {stats.characters} characters
        </p>
        <p>{(0.008 * stats.words).toFixed(2)} Minutes to read</p>
        <h3>Preview</h3>
        <p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{text.length > 0 ? text : 'Nothing to Preview'}</p>
      </div>
    </>
  );
}
