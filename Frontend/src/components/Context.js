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
    backgroundImage: "",
    savedThemes: []
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'UPDATE_TEXT_SIZE':
            // console.log("Updated text size context to be " + action.payload);
            return { ...state, settingTextSize: action.payload };
        case 'UPDATE_COLOR_ALL':
            // console.log("Updated context colors " + action.payload);
            return { ...state, 
                        colorBackground: action.payload[0],
                        colorText: action.payload[1],
                        colorBorder: action.payload[2],
                        colorAccent: action.payload[3]
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
            // console.log("Updated background image context to be " + action.payload);
            return { ...state, backgroundImage: action.payload };
        case 'UPDATE_SAVED_THEMES':
            // console.log("Updated saved theme context to be:");
            // console.log(action.payload);
            return { ...state, savedThemes: action.payload };
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
        dispatch({type: 'UPDATE_TEXT_SIZE', payload: await getUserField('/api/profile/get_text_size')});
        dispatch({type: 'UPDATE_BACKGROUND_IMAGE', payload: await getUserField('/api/profile/get_background_image')});
        dispatch({type: 'UPDATE_COLOR_ALL', payload: await getUserField('/api/profile/get_color_palette')});
        dispatch({type: 'UPDATE_SAVED_THEMES', payload: await getUserField('/api/profile/get_saved_themes')});
    }
    useEffect(() => {
        try {
            fetchContextData();
        } catch (e) {
            console.error("Error fetching context: " + e);
        }
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