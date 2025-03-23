import React, { useState } from 'react';

export default function TextForm(props) {
  const handleUpClick = () => {
    let newText = text.toUpperCase();
    setText(newText);
    props.showAlert('Converted to Uppercase!', 'success');
  };

  const handleLowClick = () => {
    let newText = text.toLowerCase();
    setText(newText);
    props.showAlert('Converted to Lowercase!', 'success');
  };

  const handleClearClick = () => {
    setText('');
    props.showAlert('Text cleared!', 'success');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    props.showAlert('Copied to clipboard', 'success');
  };

  const handleExtraSpaces = () => {
    let newText = text.split(/[ ]+/).join(' ');
    setText(newText);
    props.showAlert('Extra spaces removed!', 'success');
  };

  const handleCamelCaseClick = () => {
    let words = text.toLowerCase().split(/\s+/);
    let camelCaseText = words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '); // Join words with spaces
    setText(camelCaseText);
    props.showAlert('Converted to Camel Case!', 'success');
  };

  const handleOnChange = (event) => {
    setText(event.target.value);
  };

  const [text, setText] = useState('');

  return (
    <>
      <div
        className="container"
        style={{ color: props.mode === 'dark' ? 'white' : 'black' }}
      >
        <h2 className="mb-4">{props.heading}</h2>
        <div className="mb-3">
          <textarea
            className="form-control"
            value={text}
            onChange={handleOnChange}
            style={{
              backgroundColor:
                props.mode === 'dark' ? 'rgb(36 74 104)' : 'white',
              color: props.mode === 'dark' ? 'white' : 'black',
            }}
            rows="8"
            id="myBox"
          ></textarea>
        </div>
        <button
          disabled={text.length === 0}
          className="btn btn-primary mx-2 my-2"
          onClick={handleUpClick}
        >
          Convert to Uppercase
        </button>
        <button
          disabled={text.length === 0}
          className="btn btn-primary mx-2 my-2"
          onClick={handleLowClick}
        >
          Convert to Lowercase
        </button>
        <button
          disabled={text.length === 0}
          className="btn btn-primary mx-2 my-2"
          onClick={handleClearClick}
        >
          Clear
        </button>
        <button
          disabled={text.length === 0}
          className="btn btn-primary mx-2 my-2"
          onClick={handleCopy}
        >
          Copy Text
        </button>
        <button
          disabled={text.length === 0}
          className="btn btn-primary mx-2 my-2"
          onClick={handleExtraSpaces}
        >
          Remove Extra Spaces
        </button>
        <button
          disabled={text.length === 0}
          className="btn btn-primary mx-2 my-2"
          onClick={handleCamelCaseClick}
        >
          Convert to Camel Case
        </button>
      </div>
      <div
        className="container my-2"
        style={{ color: props.mode === 'dark' ? 'white' : 'black' }}
      >
        <h1>Your Text Summary</h1>
        <p>
          {text.split(/\s+/).filter((element) => element.length !== 0).length}{' '}
          words and {text.length} characters
        </p>
        <p>
          {0.008 *
            text.split(' ').filter((element) => element.length !== 0)
              .length}{' '}
          Minutes to read
        </p>
        <h3>Preview</h3>
        <p>{text.length > 0 ? text : 'Nothing to Preview'}</p>
      </div>
    </>
  );
}
