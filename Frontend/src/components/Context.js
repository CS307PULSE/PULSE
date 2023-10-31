import { createContext, useContext, useReducer } from 'react';
import { pulseColors } from '../theme/Colors';

const AppContext = createContext();

const initialState = {
    settingTextSize: 1,
    colorBackground: pulseColors.black,
    colorText: pulseColors.white,
    colorBorder: pulseColors.white,
    colorAccent: pulseColors.green,
    backgroundImage: "https://wallpapers.com/images/featured/blue-galaxy-txrbj85vrv1fzm4c.jpg"
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
            console.log("Updated background color context to be " + action.payload);
            return { ...state, colorBackground: action.payload };
        case 'UPDATE_COLOR_TEXT':
            console.log("Updated text color context to be " + action.payload);
            return { ...state, colorText: action.payload };
        case 'UPDATE_COLOR_BORDER':
            console.log("Updated border color context to be " + action.payload);
            return { ...state, colorBorder: action.payload };
        case 'UPDATE_COLOR_ACCENT':
            console.log("Updated color accent context to be " + action.payload);
            return { ...state, colorAccent: action.payload };
        case 'UPDATE_BACKGROUND_IMAGE':
            console.log("Updated background image context to be " + action.payload);
            return { ...state, backgroundImage: action.payload };
        default:
            return state;
    }
};

export const AppContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
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