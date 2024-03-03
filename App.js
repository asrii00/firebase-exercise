import { StatusBar } from 'expo-status-bar';
import { Button, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import { MESSAGES, addDoc, collection, firestore, serverTimestamp } from './firebase/Config';
import { useEffect, useState } from 'react';
import { onSnapshot, orderBy, query } from 'firebase/firestore';
import { convertFirebaseTimeStampToJS } from './helpers/Functions';

export default function App() {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')

  const save = async () => {
    const docRef = await addDoc(collection(firestore, MESSAGES), {
      text: newMessage, 
      created: serverTimestamp()
    }).catch ( error => console.log(error))
    setNewMessage('')
    console.log('Message saved')
  }

  useEffect(()=>{
    const q = query(collection(firestore, MESSAGES), orderBy('created', 'desc'))
    

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tempMessages = [] 
      querySnapshot.forEach((doc) => {
        const messageObject = {
          id: doc.id, 
          text: doc.data().text, 
          created: convertFirebaseTimeStampToJS(doc.data().created)
        }
        tempMessages.push(messageObject)
      })
      setMessages(tempMessages)
    })

    return () => {
      unsubscribe()
    }
    
  }, [])


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        { messages.map((message) => (
          <View style={styles.message} key= {message.id}>
            <Text style={styles.messageInfo}>{message.created}</Text>
            <Text>{message.text}</Text>
          </View>
        ))}
      </ScrollView>
      <TextInput placeholder='Send message...' value={newMessage} onChangeText={text => setNewMessage(text)}/>
      <Button title='Send' type='button' onPress={save}/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    flex: 1,
    backgroundColor: '#fff',
    margin: 5
  },
  message: {
    padding: 10, 
    marginTop: 10, 
    marginBottom: 10, 
    backgroundColor: '#f5f5f5', 
    borderColor:'#ccc', 
    borderWidth: 1, 
    borderRadius: 5, 
    marginLeft: 10, 
    marginRight: 10
  },
  messageInfo: {
    fontSize: 12
  }
});
