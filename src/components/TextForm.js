import React, { useState } from 'react'


export default function TextForm(props) {

    const handelUpClick = () => {
        let newText = text.toUpperCase();
        setText(newText);
        props.showAlert("Converted to Uppercase!", "success");
    }
    const handelLowClick = () => {
        let newText = text.toLowerCase();
        setText(newText);
        props.showAlert("Converted to Lowercase!", "success");
    }
    const handelClearClick = ()=>{
        let newText = '';
        setText(newText);
        props.showAlert("Text cleared!", "success");
    }
    const handelCopy = ()=>{
        navigator.clipboard.writeText(text);
        props.showAlert("copied to clipboard", "success");
    }
    const handelExtraSpaces = ()=>{
        var newText = text.split(/[ ]+/);
        setText(newText.join(" "));
        props.showAlert("Extraspaces removed!", "success");
    }

    const handelOnChange = (event) => {
        setText(event.target.value);                    // textarea me kuchh bhi type krne par phir se vo text k equal ho jana chahiye tnhi likh payenge text area me
    }
    const [text, setText] = useState('');
    return (
        <>
            <div className='container' style={{color: props.mode ==='dark'?'white':'black'}}>
                <h2 className='mb-4'>{props.heading}</h2>
                <div className="mb-3">
                    <textarea className="form-control" value={text} onChange={handelOnChange} style={{backgroundColor: props.mode ==='dark'?'rgb(36 74 104)':'white', color: props.mode==='dark'?'white':'black'}} rows="8" id="myBox"></textarea>
                </div>
                <button disabled={text.length===0} className="btn btn-primary mx-2 my-2" onClick={handelUpClick}>Convert to Uppercase</button>      {/* Here we have use the disabled command to disable buttons when there is nothing in the box */}
                <button disabled={text.length===0} className="btn btn-primary mx-2 my-2" onClick={handelLowClick}>Convert to Lowercase</button>
                <button disabled={text.length===0} className="btn btn-primary mx-2 my-2" onClick={handelClearClick}>Clear</button>
                <button disabled={text.length===0} className="btn btn-primary mx-2 my-2" onClick={handelCopy}>Copy Text</button>
                <button disabled={text.length===0} className="btn btn-primary mx-2 my-2" onClick={handelExtraSpaces}>Remove Extra Spaces</button>
            </div>
            <div className="container my-2" style={{color: props.mode ==='dark'?'white':'black'}}>
                <h1>Your Text summary</h1>
                <p>{text.split(/\s+/).filter((element)=>{return element.length !== 0}).length} words and {text.length} characters</p>
                <p>{0.008 * text.split(" ").filter((element)=>{return element.length !== 0}).length} Minutes to read</p>
                <h3>Preview</h3>
                <p>{text.length>0?text:"Nothing to Preview"}</p>
            </div>
        </>
    )
}
