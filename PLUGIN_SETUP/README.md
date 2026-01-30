# Welcome To HOPE Development Rules

Dear Team,

To ensure consistency and maintainability across our project, we kindly request that all team members use the following code format in their code submissions. This will help us avoid any potential issues that may arise from different formatting styles.

***

1. **Indentation**
    * Use Format Document before sending your code for review.
    * remove auto formatting to fit page.

2. **Braces**
    * Opening braces should be on the same line as the statement.
    * Closing braces should be on their own line.
    * *Example*
    ```
    if (condition) { 
        // Code block 
    } else { 
        // Code block 
    }
    ```

3. **Semicolons**
    * Use semicolons at the end of each statement.

4. **Logs**
    * Always remove the logs before sending your code for review.

5. **Unused Code**
    * Always remove the unwanted code and styling before sending your code for review.

6. **OnPress Function**
    * Move onPress event code exceeding 3 lines to a separate function instead of keeping it inline.

7. **Line Length**
    * Keep lines shorter than 80 characters to ensure readability.

8. **Reusablity**
    * It is recommended to utilize the global StyleSheet for styling and to develop reusable code.

9. **Text**
    * Text styles must always include color,Size and font family.

10. **Color**
    * It's recommended to utilize the primary color provided in the Color.js file for styling purposes.

11. **Variable Declarations**
    * Use const or let to declare variables.
    * Place a space after the variable name, and before the assignment operator (=).
    * Use camelCase for variable names.
    * Declare each variable on a separate line.

12. **Function Declarations**
    * Use arrow function syntax for function declarations.
    * Place a space between the function name and the argument list.
    * Use parentheses around the argument list, even when there is only one argument.
    * Place the opening brace on the same line as the function declaration.
    * Use return statement whenever possible.
    * *Example*
    ```
    const add = (a, b) => { 
        return a + b; 
    };
    ```

13. **HOPE template For Screens**
```
import React, { useState } from 'react'; 
import { View, Text, StyleSheet } from 'react-native'; 
import GlobalStyles from '../utils/GlobalStyles'; 
import Fonts from '../utils/Fonts'; 
import Colors from '../utils/Colors'; 
import { heightToDp, widthToDp } from '../utils/Responsive'; 
import VectorIcons from '../components/VectorIcons'; 
import { useNavigation } from '@react-navigation/native'; 
import Global from '../screens/Global'; 
const MyScreen = () => { 
    const navigation = useNavigation(); 
    const [text, setText] = useState('Hello, World!'); 
    return ( 
        <SafeAreaView style={GlobalStyles.mainContainer}> 
            <View style={GlobalStyles.mainBox}> 
                <Header 
                    headerTitle="Select Appointment Type" 
                    onPress={() => navigation.navigate("CreateAppointment")} 
                /> 
                <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold]}>{text}</Text> 
                <Text style={[GlobalStyles.extrasmallText, Fonts.Nunito_400Regular]}>{text}</Text> 
                <Footer navigation={navigation} /> 
            </View> 
        </SafeAreaView> 
    ); 
}; 
const styles = StyleSheet.create({ }); 
export default MyScreen;
```
***

Thank you for your cooperation in maintaining a consistent code format across the project. 

Best regards, 

Team Mobile App