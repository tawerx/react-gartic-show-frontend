import React from 'react';
import { useSelector } from 'react-redux';

const PlayerList = ({ socket }) => {
  const { users } = useSelector((state) => state.logic);

  return (
    <div className="playerList">
      <div className="title">
        <p>Игроки</p>
      </div>
      <div className="player-list">
        <ul>
          {users.map((obj) => {
            return <li key={obj.id}>{`${obj.nick} ${obj.role == 'writer' ? `- рисует` : ''}`}</li>;
          })}
        </ul>
      </div>
    </div>
  );
};

export default PlayerList;
