import { useEffect } from "react"

function TextResult (props) {
    useEffect(()=>{
        const el = document.getElementsByClassName("toolBody")[0];
        el.scrollTo({top:el.clientHeight,left:0,behavior:"smooth"})
    },[props.text])

    return (
        <div className={"text_result"+(props.error?" error":"")} >{props.text}</div>
    )
}

export default TextResult