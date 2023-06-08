import { useEffect, useRef } from "react"

function TextResult (props) {
    const textResultRef = useRef(null);
    useEffect(()=>{
        textResultRef.current.scrollIntoView({behavior: "smooth",block: "end"});
        textResultRef.current.classList.add("hidden");
        setTimeout(()=>textResultRef.current.classList.remove("hidden"),200)
    },[props.text])
    const result = props.modifyFunc 
        ? props.modifyFunc(props.text) 
        : props.text?.includes("\n") ? props.text.split("\n").map((item,idx)=>{return <p key={idx}>{item}</p>}) : props.text
    return (
        <div className={"text_result"+(props.error?" error":"")} ref={textResultRef}>{result}</div>
    )
}

export default TextResult