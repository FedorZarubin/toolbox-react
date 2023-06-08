import React from "react";
import Icon from "@mdi/react";
import { mdiCheck, mdiCog,mdiBroom, mdiContentCopy} from '@mdi/js'
import spinner from '../img/spinner.svg'

class ButtonsBar extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            isCopied: false
        };
        this.handleCopy = this.handleCopy.bind(this)
    }

    handleCopy (e) {
        if (typeof(this.props.textToCopy)==="string") {
            navigator.clipboard.writeText(this.props.textToCopy);
        } else {
            const text = e.target.parentNode.querySelector(".btnCopyField").innerHTML;
            navigator.clipboard.writeText(text);
        }
        this.setState({isCopied: true});
        setTimeout(()=>{this.setState({isCopied: false})},2000);
    }

    render () {
    const settings = (<Icon className="btn" path={mdiCog} onClick={() => {window.alert("Coming soon...")}} size="30px"/>);
    const clear = (<Icon className="btn" path={mdiBroom} onClick={() => {this.props.clearFunc()}} size="30px"/>);
    const copy = this.state.isCopied 
        ? <Icon className="btn" path={mdiCheck} size="30px" color={"#41ff8a"}/>
        : <Icon className="btn" path={mdiContentCopy} onClick={this.handleCopy} size="30px"/>;
    return (
        <div className="buttons">
            <div> {/*align left */}
                {
                    this.props.isPending?
                    (<img className="spinner" src={spinner} alt="spinner"/>):
                    (<input type="submit" className="go" value="Go!" />)
                }
                {this.props.buttons.includes("clear")?clear:null}
            </div>
            <div> {/*align right */}
                {this.props.buttons.includes("copy")?copy:null}
                {this.props.buttons.includes("settings")?settings:null}
                {typeof(this.props.textToCopy)!=="string" ? <div className="btnCopyField" style={{display:"none"}}>{this.props.textToCopy}</div> : null}
            </div>
        </div>
    )}
}

export default ButtonsBar