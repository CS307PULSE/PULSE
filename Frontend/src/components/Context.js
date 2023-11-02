import { createContext, useContext, useReducer, useEffect } from 'react';
import { pulseColors } from '../theme/Colors';
import axios from 'axios';

const AppContext = createContext();

const initialState = {
    settingTextSize: 1,
    colorBackground: pulseColors.black,
    colorText: pulseColors.white,
    colorBorder: pulseColors.white,
    colorAccent: pulseColors.green,
    backgroundImage: ""
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'UPDATE_TEXT_SIZE':
            console.log("Updated text size context to be " + action.payload);
            return { ...state, settingTextSize: action.payload };
        case 'UPDATE_COLOR_ALL':
            console.log("Updated context colors");
            return { ...state, 
                        colorBackground: action.payload[0],
                        colorText: action.payload[1],
                        colorBorder: action.payload[2],
                        colorAccent: action.payload[3],             
                    };
        case 'UPDATE_COLOR_BACKGROUND':
            // console.log("Updated background color context to be " + action.payload);
            return { ...state, colorBackground: action.payload };
        case 'UPDATE_COLOR_TEXT':
            // console.log("Updated text color context to be " + action.payload);
            return { ...state, colorText: action.payload };
        case 'UPDATE_COLOR_BORDER':
            // console.log("Updated border color context to be " + action.payload);
            return { ...state, colorBorder: action.payload };
        case 'UPDATE_COLOR_ACCENT':
            // console.log("Updated color accent context to be " + action.payload);
            return { ...state, colorAccent: action.payload };
        case 'UPDATE_BACKGROUND_IMAGE':
            console.log("Updated background image context to be " + action.payload);
            return { ...state, backgroundImage: action.payload };
        default:
            return state;
    }
};
async function getUserField(route) {
    var response = await axios.get(route, { withCredentials: true });
    return response.data;
}

export const AppContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    async function fetchContextData() {
        dispatch({type: 'UPDATE_BACKGROUND_IMAGE', payload: await getUserField('http://127.0.0.1:5000/profile/get_background')});
        dispatch({type: 'UPDATE_TEXT_SIZE', payload: await getUserField('http://127.0.0.1:5000/get_text_size')});
    }
    useEffect(() => {
        fetchContextData();
    }, []);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    return useContext(AppContext);
};

export async function retrieveContext() {

}