import React from "react";
import styled from "styled-components";

const TopContainer = styled.div`
  height: 10vh;
  background-color: --background-colour;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const Title = styled.h1`
  text-align: center;
`;

interface TitlebarProps {
  title: string;
}

const Titlebar: React.FC<TitlebarProps> = ({ title }) => {
  return (
    <TopContainer>
      <Title>{title}</Title>
    </TopContainer>
  );
};

export default Titlebar;
