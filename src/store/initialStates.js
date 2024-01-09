const initialStates = {
    audit : {
        values: {
            domain_name: "",
            dat_beg: "",
            time_beg: "",
            dat_end: "",
            time_end: "",
            searchStr: "",
            case_sens: false,
            ip: null,
            postProc: "noneed",
        },
        result: {
            text: null,
            isErr: false,
            clearAfter: null
        },
        isPending: false,
        settings: {
            isOpen: false,
            isErr: false,
            errText: null,
            value: "",
            clearAfter: null
        }
    },
    promocodes: {
        values: {
            promoType: "option",
            provideType: "offline",
            services: [],
            months4Srv: 0,
            clientType:[],
            days4Demo: 0,
            isMultiUse: "no",
            multiUsePromo: "",
            multiUseCount: 0,
            promoCount: 0,
            champingDesc: "",
            dateTill: "",
            promoEmail:"",
            wizardActiveScreen: 0
        },
        result: {
            text: null,
            isErr: false
        }
    },
    dateConv: {
        values: {
            ts: "",
            d: "",
            t: "",
            tz1: "msk",
            tz2: "msk"
        },
        result: {
            text: null,
            isErr: false
        }
    },
    prefsParse: {
        values: {
            sourcePrefs: "",
            jsonToEdit: "",
            selectedPrefsBlock: "All",
        },
        outJson: null,
        isPending: false,
        result: {
            text: null,
            isErr: false
        }
    },
    numProc: {
        values: {
            inpNumbers: "",
            inLineOutSeparator: " ",
            mfbossiCmd: "activate",
            mfbossiSleep: 1,
            mfbossi2file: false,
            curlType: "srvMgmt",
            srvMgmt_action: "status",
            srvType: "7005",
            curlSleep: 1,
            curl2file: false
        },
        result: {
            text: null,
            isErr: false
        },
        clearResultAfter: null
    },
    xmlParse: {
        values: {
            inpXML: "",
            filterSrv: "",
            filterStatus: "",
        },
        srvList: null,
        result: {
            text: null,
            isErr: false,
        }
    },
    individualTariff: {
        values: {
            domain_name: "",
            operationType: "set",
            seatsIncl_count: 7
        },
        result: {
            text: null,
            isErr: false
        }
    }
} 

export default initialStates