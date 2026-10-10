import React from 'react'

export default function Alert(props) {
    // function to capitalize the first letter of warning
    const capitalize = (word)=>{
        const lower = word.toLowerCase();
        return lower.charAt(0).toUpperCase() + lower.slice(1);
    }

    return (                                    // yahan agar props.alert null hoga to aage kaa evaluate nhi hoga because and operator hai
        <div className="tu-alert-host" aria-live="polite">     {/*Alert ko fixed position diya hai taaki layout shift na ho*/}
       { props.alert && <div className={`alert alert-${props.alert.type} shadow-sm mb-0`} role="alert">
            <strong>{capitalize(props.alert.type)}: </strong>{props.alert.msg}
        </div>}
        </div>
    )
}
