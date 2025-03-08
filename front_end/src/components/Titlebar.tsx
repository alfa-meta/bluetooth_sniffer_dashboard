import React from "react";
import styled from "styled-components";

const TopContainer = styled.div`
  height: 60px;
  background-color: var(--background-colour);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  border-bottom: 1px solid var(--border-colour);
`;

const Title = styled.h1`
  text-align: center;
  font-size: 20px;
  margin: 0;
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
