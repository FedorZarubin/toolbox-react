import { useEffect } from "react"

function TextResult (props) {
    useEffect(()=>{
        const el = document.getElementsByClassName("toolBody")[0];
        el.scrollTo({top:el.clientHeight,left:0,behavior:"smooth"});
        document.getElementsByClassName("text_result")[0].classList.add("hidden");
        setTimeout(()=>document.getElementsByClassName("text_result")[0].classList.remove("hidden"),200)
    },[props.text])
    // const result = typeof(props.text) === "string" && props.text.includes("\n") ? props.text.split("\n").map((item,idx)=>{return <p key={idx}>{item}</p>}) : props.text
    const result = props.modifyFunc 
        ? props.modifyFunc(props.text) 
        : props.text?.includes("\n") ? props.text.split("\n").map((item,idx)=>{return <p key={idx}>{item}</p>}) : props.text
    return (
        <div className={"text_result"+(props.error?" error":"")} >{result}</div>
    )
}

export default TextResult