import { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
    settingTextSize: 1
    // colorBackground: "black",
    // colorText: "white",
    // colorBorder: "white",
    // colorAccent: "white"
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'UPDATE_TEXT_SIZE':
            return { ...state, settingTextSize: action.payload };
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