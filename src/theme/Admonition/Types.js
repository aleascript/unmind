import React from 'react';
import DefaultAdmonitionTypes from '@theme-original/Admonition/Types';

function DesignAdmonition(props) {
  const Note = DefaultAdmonitionTypes.note;

  return (
    <div className="theme-admonition-design">
      <Note {...props} />
    </div>
  );
}

export default {
  ...DefaultAdmonitionTypes,
  design: DesignAdmonition,
};
