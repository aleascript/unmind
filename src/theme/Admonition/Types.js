import React from 'react';
import DefaultAdmonitionTypes from '@theme-original/Admonition/Types';

function DesignAdmonition(props) {
  const Note = DefaultAdmonitionTypes.note;
  const className = ['theme-admonition-design', props.className]
    .filter(Boolean)
    .join(' ');

  return <Note {...props} type="note" className={className} />;
}

export default {
  ...DefaultAdmonitionTypes,
  design: DesignAdmonition,
};
