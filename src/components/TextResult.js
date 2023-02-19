function TextResult (props) {
    return (
        <div className={"text_result"+(props.error?" error":"")} >{props.text}</div>
    )
}

export default TextResult