import { createTheme } from '@mui/material/styles';

const customTheme = createTheme({
    palette: {
		primary: {
			main: '#335f5e',
			light: '#dffeff',
			dark: '#004242',
		}
        
	},
    components: {
        MuiTextField: {
            styleOverrides: {
                root: {
                // '& label': {
                //     color: '#335f5e'
                // },
                // '& label.Mui-focused': {
                //     color: '#335f5e'
                // },
                // '& .MuiInput-underline:after': {
                //     borderBottomColor: '#335f5e'
                // },
                '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                    borderColor: '#000000'
                    },
                    // '&:hover fieldset': {
                    //     borderColor: '#335f5e',
                    //     // borderWidth: '0.15rem'
                    // },
                    // '&.Mui-focused fieldset': {
                    // borderColor: '#335f5e'
                    // }
                }
                }
            }
        }
    }
});

export default customTheme;

