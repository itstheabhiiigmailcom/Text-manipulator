import React from 'react'

export default function Alert(props) {
    // function to capitalize the first letter of warning
    const capitalize = (word)=>{
        const lower = word.toLowerCase();
        return lower.charAt(0).toUpperCase() + lower.slice(1);
    }

    return (                                    // yahan agar props.alert null hoga to aage kaa evaluate nhi hoga because and operator hai
        <div style={{height: '50px'}}>          {/*Alert ka height set kr dene se baar baar layout shift nhi hoga because now it has own height*/}
       { props.alert && <div className={`alert alert-${props.alert.type} alert-dismissible fade show`} role="alert">
            <strong>{capitalize(props.alert.type)}</strong>{props.alert.msg}
        </div>}
        </div>
    )
}
