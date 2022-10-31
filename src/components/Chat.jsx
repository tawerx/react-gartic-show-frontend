import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setMessages } from '../redux/slices/logicSlice';

const Chat = ({ send }) => {
  const { role } = useSelector((state) => state.logic);
  const dispatch = useDispatch();
  const { chat } = useSelector((state) => state.logic);
  const [value, setValue] = React.useState('');
  return (
    <div className="chat">
      <div className="chat-messages">
        <ul>
          {chat.map((message) => {
            return <li key={message}>{`${message}`}</li>;
          })}
        </ul>
      </div>
      {role == 'writer' ? null : (
        <div className="chat-control">
          <input
            onChange={(e) => setValue(e.target.value)}
            value={value}
            placeholder="Введите сообщение"
          />
          <button
            onClick={() => {
              send(`${localStorage.nick}: ${value}`);
              setValue('');
              dispatch(setMessages(`${localStorage.nick}: ${value}`));
            }}>
            Отправить
          </button>
        </div>
      )}
    </div>
  );
};

export default Chat;
