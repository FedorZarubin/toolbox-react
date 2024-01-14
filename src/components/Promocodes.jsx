import { useSelector, useDispatch } from "react-redux";
import ToolHeader from "./ToolHeader";
import RadioBtn from "./RadioBtn";
import Select from "./Select";
import Wizard from "./Wizard";
import TextResult from "./TextResult";
import ButtonsBar from "./ButtonsBar";

function Promocodes (props) {

    const state = useSelector((state => state.promocodes));
    const dispatch = useDispatch();


    const services = [
        ["analytics","Аналитика"],
        ["callsrecord","Запись"],
        ["crm","CRM"],
        ["callback","Обратный звонок"],
        ["effectivesale","Эффектвные продажи"],
        ["emotion","Звонки на повышенных тонах"],
        ["bigbusiness","Большой бизнес"],
        ["autocaller","Автоинформирование"],
        ["effectiveservice","Эффективное обслуживание"]
    ];
    const [values, result] = [state.values, state.result];
    const buttons = result.text? ["clear","copy"]:[];
    const handleChange = (e) => {dispatch({
        type: "promocodes/set_values",
        name: e.target.name,
        newVal: e.target.value
    })};
    const generetePromo = function (e) {
        e.preventDefault()
        const errList = [];
        if (values.promoType === "option") {
            if (values.services.length === 0) errList.push("Не выбраны опции");
            if (values.months4Srv === 0) errList.push("Срок пользования опциями");
            if (values.clientType.length === 0) errList.push("Не выбран тип клиентов");
        } else {
            if (values.days4Demo === 0) errList.push("Срок продления демо");            
        }
        if (values.isMultiUse === "no" && values.promoCount === 0) errList.push("Количество промокодов");
        if (values.isMultiUse === "yes") {
            if (values.multiUsePromo === "") errList.push("Не указан многоразовый промокод");
            if (values.multiUseCount === "") errList.push("Количество возможных активаций");
        }
        if (values.provideType === "offline" && values.isMultiUse === "no" 
            && !values.promoEmail.match(/^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/)) errList.push("E-Mail");
        if (values.champingDesc === "") errList.push("Название промокампании");
        if (values.dateTill === "") errList.push("Срок активации");
        if (errList.length) {
            dispatch({
                type: "promocodes/set_result",
                text: "Не заполнены или некорректно заполнены следующие поля:\n"+errList.join("\n"),
                isErr: true
            });
            return
        }

        const offline = values.provideType === "offline" && (values.promoType === "option" || values.isMultiUse === "no")
            ? " offline"
            : "";
        const start = values.isMultiUse === "no" 
            ? `mfbossi make ${values.promoCount+offline} promocode `
            : `mfbossi add reusable${offline} promocode ${values.multiUsePromo} `;
        const essence = values.promoType === "option" 
            ? `of using "${values.services.join(",")}" extensions for ${values.months4Srv} months for "${values.clientType.join(",")}" customers`
            : `of demo prolongation for ${values.days4Demo} days`;
        const champNameTail = values.promoType === "option"
            ? `${values.services.join("-")}_${values.months4Srv}m`
            : `demo_${values.days4Demo}d`;
        const champName = ` at "promo_${new Date().toISOString().slice(0,10)}_${champNameTail}" campaign `;
        const desc = `with "${values.champingDesc}" description`;
        const till = ` till "${values.dateTill}"`;
        const limited = values.isMultiUse === "yes" ? " limited "+values.multiUseCount : "";
        const toEmail = values.provideType === "offline" && values.isMultiUse === "no" ? ` to email "${values.promoEmail}"` : ""
        dispatch({
            type: "promocodes/set_result",
            text: start+essence+champName+desc+till+limited+toEmail,
            isErr: false
        });
    };
    const screen0 =  (
        <div className="optionsList">
            <div><label>На что будет промокод?</label></div>
            <RadioBtn 
                btnName="promoType"
                btnList={[["option", "Использование опций"],["demo", "Продление демо"]]}
                handleChange={handleChange}
                curValue={values.promoType}
            />
            <div><label>Какой способ выдачи?</label></div>
            <RadioBtn 
                btnName="provideType"
                btnList={[["offline", "Оффлайн"],["online", "Онлайн"]]}
                handleChange={handleChange}
                curValue={values.provideType}
            />
        </div>
    );
    const screen1 = (
        <div className="optionsList">
            {values.promoType === "option" 
                ? (<>
                    <div><label>Выберите услуги</label></div>
                    <Select
                        selectName="services"
                        optList={services}
                        handleChange={handleChange}
                        curValue={values.services}
                        isMultiple={true}
                    />
                    <div><label htmlFor="months4Srv">На сколько месяцев?</label></div>
                    <div className="generalInput">
                        <input 
                            type="number" 
                            name="months4Srv" 
                            id="months4Srv" 
                            value={values.months4Srv}
                            onChange={handleChange}
                        />
                    </div>
                    <div><label>Для каких клиентов?</label></div>
                    <Select
                        selectName="clientType"
                        optList={[["blocked","Заблокированных"],["demo","Новых"],["commercial","Действующих"]]}
                        handleChange={handleChange}
                        curValue={values.clientType}
                        isMultiple={true}
                    />
                </>)
                : (<>
                        <div><label htmlFor="days4Demo">На сколько дней продляем?</label></div>
                        <div className="generalInput">
                            <input 
                                type="number" 
                                name="days4Demo" 
                                id="days4Demo" 
                                value={values.days4Demo}
                                onChange={handleChange}
                            />
                        </div>

                   </>)
                }
        </div>
    );
    const screen2 = (
        <div className="optionsList">
            <div><label>Какой будет промокод?</label></div>
            <RadioBtn
                btnName="isMultiUse"
                btnList={[["no", "Одноразовый"],["yes", "Многоразовый"]]}
                handleChange={handleChange}
                curValue={values.isMultiUse}
            />
            {values.isMultiUse === "yes"
                ? (<>
                    <div><label htmlFor="multiUsePromo">Промокод:</label></div>
                    <div className="generalInput">
                        <input 
                            type="text" 
                            name="multiUsePromo" 
                            id="multiUsePromo" 
                            value={values.multiUsePromo}
                            onChange={handleChange}
                        />
                    </div>
                    <div><label htmlFor="multiUseCount">Количество возможных активаций:</label></div>
                    <div className="generalInput">
                        <input 
                            type="number" 
                            name="multiUseCount" 
                            id="multiUseCount" 
                            value={values.multiUseCount}
                            onChange={handleChange}
                        />
                    </div>
                </>)
                : (<>
                    <div><label htmlFor="promoCount">Количество одноразовых промокодов:</label></div>
                    <div className="generalInput">
                        <input 
                            type="number" 
                            name="promoCount" 
                            id="promoCount" 
                            value={values.promoCount}
                            onChange={handleChange}
                        />
                    </div>
                </>)
            }
        </div>
    );

    const screen3 = (
        <div className="optionsList">
            <div><label htmlFor="champingDesc">Название промокампании:</label></div>
            <div className="generalInput">
                <input 
                    type="text" 
                    size="100"
                    name="champingDesc" 
                    id="champingDesc" 
                    value={values.champingDesc}
                    onChange={handleChange}
                />
            </div>
            <div><label htmlFor="dateTill">Срок активации:</label></div>
            <div className="generalInput">
                <input 
                    type="date" 
                    name="dateTill" 
                    id="dateTill" 
                    value={values.dateTill}
                    onChange={handleChange}
                />
            </div>
            {(values.provideType === "offline" && values.isMultiUse === "no" &&
                <>
                    <div><label htmlFor="promoEmail">E-Mail для отправки файла с кодами:</label></div>
                    <div className="generalInput">
                        <input 
                            type="text" 
                            name="promoEmail" 
                            id="promoEmail" 
                            value={values.promoEmail}
                            onChange={handleChange}
                        />
                    </div>
                </>)}
        </div>
    )

    return (
        <div className="toolContainer">
            <ToolHeader value={props.title}/>
            <div className="toolBody">
                <form onSubmit={generetePromo}>
                    <Wizard 
                        screens={[screen0,screen1,screen2,screen3]} 
                        activeScreen={values.wizardActiveScreen}
                        switchScreenFunc={(i)=>{handleChange({target:{name:"wizardActiveScreen",value:i}})}} 
                        id={"promoWizard"}
                        finishFunc={generetePromo}
                    />
                    <ButtonsBar
                        buttons={buttons} 
                        textToCopy={result.text}
                        clearFunc={()=>dispatch({ type: "promocodes/clear"})}                
                    />
                </form>
                {result.text && <TextResult text={result.text} error={result.isErr}/>}
            </div>
        </div>
    );
}

export {Promocodes} ;