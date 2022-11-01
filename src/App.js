import React from 'react';
import Canvas from './components/Canvas';
import Chat from './components/Chat';
import Header from './components/Header';
import './styles/app.scss';
import { useSelector, useDispatch } from 'react-redux';
import {
  setChat,
  setDrawFlag,
  setGameWord,
  setMessages,
  setRole,
  setUsers,
} from './redux/slices/logicSlice';
import { io } from 'socket.io-client';
import axios from 'axios';
import PlayerList from './components/PlayerList';

const App = () => {
  const dispatch = useDispatch();
  const { gameWord, currentTool, color, role } = useSelector((state) => state.logic);
  const [create, setCreate] = React.useState(false);
  const [canvasImage, setCanvasImage] = React.useState('');
  const socketRef = React.useRef();
  const canvasRef = React.useRef();
  const onClickCreate = () => {
    if (gameWord == '') {
      alert('Введите слово!');
    } else {
      setCreate(!create);
      if (socketRef.current) {
        socketRef.current.emit('setGameWord', gameWord);
      }
      dispatch(setDrawFlag(true));
    }
  };

  React.useEffect(() => {
    socketRef.current = io(`http://localhost:3005/`, {
      transports: ['websocket'],
    });

    if (localStorage.nick == undefined) {
      localStorage.setItem('nick', prompt('Введите nickname'));
    }
    socketRef.current.emit('nickname', localStorage.nick);

    socketRef.current.on('canvasImg', (data) => {
      if (canvasRef.current) {
        const img = new Image();
        img.src = data;
        img.onload = () => {
          canvasRef.current.clearRect(0, 0, 1171, 800);
          canvasRef.current.drawImage(img, 0, 0, 1171, 800);
        };
      }
    });

    socketRef.current.on('clearCanvas', (data) => {
      if (canvasRef.current) {
        canvasRef.current.clearRect(0, 0, 1171, 800);
      }
    });

    socketRef.current.on('role', (role) => {
      dispatch(setRole(role));
    });
    axios.get(`http://localhost:3005/messages`).then((res) => {
      dispatch(setChat(res.data));
    });

    axios.get(`http://localhost:3005/canvas`).then((res) => {
      setCanvasImage(res.data);
    });

    socketRef.current.on('endGame', ({ nick, message }) => {
      alert(`${nick} ${message}`);
      dispatch(setDrawFlag(false));
      dispatch(setGameWord(''));
      setCreate(false);
    });
    socketRef.current.on('getMessage', (msg) => {
      dispatch(setMessages(msg));
    });
  }, []);

  React.useEffect(() => {
    const img = new Image();
    img.src = canvasImage;
    img.onload = () => {
      canvasRef.current.clearRect(0, 0, 1171, 800);
      canvasRef.current.drawImage(img, 0, 0, 1171, 800);
    };
  }, [canvasImage]);

  if (socketRef.current) {
    socketRef.current.on('getUsers', (data) => {
      dispatch(setUsers(data));
    });
  }

  const canvasImg = (data) => {
    if (socketRef.current) {
      socketRef.current.emit('canvasImg', data);
    }
  };

  const painting = (data) => {
    if (socketRef.current) {
      socketRef.current.emit('coor', data);
    }
  };
  const clearCanvas = (data) => {
    if (socketRef.current) {
      socketRef.current.emit('clearCanvas', data);
    }
  };

  const sendMessage = (data) => {
    if (socketRef.current) {
      socketRef.current.emit('sendMessage', data);
    }
  };

  return (
    <div className="app">
      <Header />
      <div className="container">
        <div className="leftSide">
          <PlayerList />
          <Chat send={sendMessage} />
          {role != 'writer' ? null : (
            <div className="create-word">
              {create == false ? (
                <input
                  onChange={(e) => dispatch(setGameWord(e.target.value))}
                  value={gameWord}
                  placeholder="Введите слово"
                />
              ) : (
                <p>{gameWord}</p>
              )}

              {create || <button onClick={onClickCreate}>Загадать слово</button>}
            </div>
          )}
        </div>
        <div className="rigthSide">
          <Canvas
            paint={painting}
            ctxImg={canvasImg}
            clear={clearCanvas}
            onInit={(canvasCtx) => (canvasRef.current = canvasCtx)}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
