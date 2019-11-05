import React from "react";
import { GiftedChat } from "react-native-gifted-chat";
import DataService from "../../services/data";
let Data;
import { AsyncStorage } from "react-native";
import { AsyncSubject } from "rxjs";

class Screen extends React.Component {
  state = {
    parent: {},
    messages: [],
    defaultMessage: {
      _id: 1,
      text:
        "Hello guardian, can you please explain to us what problem you want to report?",
      createdAt: new Date(),
      user: {
        _id: 2,
        name: "Guardian",
        avatar: "https://placeimg.com/140/140/any"
      }
    }
  };

  async componentWillMount() {
    Data = await DataService;
    const parent = Data.parent.get();
    const messagesStored = await AsyncStorage.getItem("messages");

    this.setState({
      parent
    });

    if (messagesStored) {
      this.setState({
        messages: JSON.parse(messagesStored).messages
      });
    }
  }

  onSend(messages = []) {
    this.setState(
      previousState => ({
        messages: GiftedChat.append(previousState.messages, messages)
      }),
      () => {
        AsyncStorage.setItem(
          "messages",
          JSON.stringify({
            messages: this.state.messages
          })
        );
        Data.complaints.send(messages);
      }
    );
  }

  render() {
    return (
      <GiftedChat
        style={{ backgroundColor: "white" }}
        messages={[...this.state.messages, this.state.defaultMessage]}
        onSend={messages => this.onSend(messages)}
        user={{
          _id: this.state.parent.id || 1
        }}
      />
    );
  }
}

export default Screen;
