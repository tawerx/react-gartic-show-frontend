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
  const [isPhone, setIsPhone] = React.useState(false);
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
      if (window.screen.width < 500) {
        setIsPhone(true);
      }
    }
  };

  React.useEffect(() => {
    socketRef.current = io(`http://95.214.63.231:80/`, {
      transports: ['websocket'],
    });

    localStorage.setItem('nick', prompt('Введите nickname'));
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
    axios.get(`http://95.214.63.231:80/messages`).then((res) => {
      dispatch(setChat(res.data));
    });

    axios.get(`http://95.214.63.231:80/canvas`).then((res) => {
      setCanvasImage(res.data);
    });

    socketRef.current.on('endGame', (data) => {
      alert(data);
      dispatch(setDrawFlag(false));
      dispatch(setGameWord(''));
      setCreate(false);
      setIsPhone(false);
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

  const afkWriter = () => {
    if (socketRef.current) {
      socketRef.current.emit('afkWriter');
    }
  };
  if (isPhone) {
    document.body.style.position = 'fixed';
    document.body.style.overflow = 'hidden';
    return (
      <>
        <Canvas
          paint={painting}
          ctxImg={canvasImg}
          clear={clearCanvas}
          afk={afkWriter}
          onInit={(canvasCtx) => (canvasRef.current = canvasCtx)}
        />
        <Chat send={sendMessage} />
      </>
    );
  } else {
  document.body.style.position = 'static';
    document.body.style.overflow = 'auto';
  }

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
                  onChange={(e) => {
                    dispatch(setGameWord(e.target.value));
                  }}
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
            afk={afkWriter}
            onInit={(canvasCtx) => (canvasRef.current = canvasCtx)}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
