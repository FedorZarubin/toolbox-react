import React from "react";
import Icon from "@mdi/react";
import { mdiCheck, mdiCog,mdiBroom, mdiContentCopy, mdiClose} from '@mdi/js'
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
        const textToCopy = typeof(this.props.textToCopy)==="string" 
        ? this.props.textToCopy
        : e.target.parentNode.querySelector(".btnCopyField").innerHTML;
        if (navigator.clipboard && window.isSecureContext) { // can we use 'navigator.clipboard'?
                navigator.clipboard.writeText(textToCopy);
        } else {                                            // fallback option
            const temp = document.createElement(typeof(this.props.textToCopy)==="string" ? 'textarea' : 'div');
            temp.style.position = 'absolute';
            temp.style.left = '-99999999px';
            document.body.prepend(temp);
            if (typeof(this.props.textToCopy)==="string") {
                temp.value = textToCopy;
                temp.select();            
            } else {
                temp.innerHTML = textToCopy;
                const range = document.createRange();
                range.selectNode(temp);
                window.getSelection().removeAllRanges();
                window.getSelection().addRange(range);
            }
            try {
                document.execCommand('copy');
            } catch (error) {
                console.log("Copy to clipboard error!");
            } finally {
                temp.remove();
            }

        }
        this.setState({isCopied: true});
        setTimeout(()=>{this.setState({isCopied: false})},2000);
    }

    render () {
    const settings = (<Icon className="btn" path={mdiCog} onClick={() => {this.props.settingsFunc()}} size="30px"/>);
    const close = (<Icon className="btn" path={mdiClose} onClick={() => {this.props.closeFunc()}} size="30px"/>);
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
                {this.props.buttons.includes("close")?close:null}
                {typeof(this.props.textToCopy)!=="string" ? <div className="btnCopyField" style={{display:"none"}}>{this.props.textToCopy}</div> : null}
            </div>
        </div>
    )}
}

export default ButtonsBar