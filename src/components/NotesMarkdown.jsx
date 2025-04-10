import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Typography, Box, Link } from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * NotesMarkdown Component
 * 
 * This component provides custom styling for different markdown elements such as paragraphs,
 * headers, lists, tables, and links, using Material UI components and styles. It uses 
 * ReactMarkdown to render markdown syntax with styled components based on the current theme.
 */
const NotesMarkdown = ({ children, ...props }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark"; // Check if the current theme is dark

  return (
    <ReactMarkdown
      {...props}
      components={{
        // Custom styling for paragraphs (p)
        p: ({ ...props }) => (
          <Typography
            variant="body1"
            sx={{
              fontFamily: "'PT Sans Narrow', sans-serif",
              mt: 0.75,
              mb: 0.75,
              marginLeft: 2,
              lineHeight: 1.6,
              fontSize: "1rem",
              color: theme.palette.text.primary,
            }}
            {...props}
          />
        ),

        // Custom styling for h1 headers
        h1: ({ children, ...props }) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              my: 3,
            }}
            {...props}
          >
            <Box
              sx={{
                flex: 1,
                height: "1px",
                backgroundColor: theme.palette.divider,
                mr: 2,
              }}
            />
            <Typography
              variant="h3"
              sx={{
                fontFamily: "'Antonio', sans-serif",
                textTransform: "uppercase",
                fontWeight: "bold",
                fontSize: "2rem",
                color: theme.palette.text.primary,
                textAlign: "center",
                whiteSpace: "nowrap",
              }}
            >
              {children}
            </Typography>
            <Box
              sx={{
                flex: 1,
                height: "1px",
                backgroundColor: theme.palette.divider,
                ml: 2,
              }}
            />
          </Box>
        ),

        // Custom styling for h2 headers
        h2: ({ ...props }) => (
          <Typography
            variant="h4"
            sx={{
              fontFamily: "'Antonio', sans-serif",
              fontWeight: "normal",
              textTransform: "uppercase",
              fontSize: "1.3em",
              pl: 2,
              py: 1,
              mb: 2,
              color: theme.palette.primary.contrastText,
              background: !isDark
                ? `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
                : `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
            }}
            {...props}
          />
        ),

        // Custom styling for h3 headers
        h3: ({ ...props }) => (
          <Typography
            variant="h5"
            sx={{
              fontFamily: "'Antonio', sans-serif",
              fontWeight: "normal",
              fontSize: "1.1em",
              textTransform: "uppercase",
              pl: 2,
              py: 1,
              mt: 2,
              mb: 1,
              color: isDark ? "#fff" : "#000",
              backgroundColor: theme.palette.ternary.main,
              borderBottom: isDark
                ? `2px solid ${theme.palette.primary.light}`
                : `2px solid ${theme.palette.primary.main}`,
            }}
            {...props}
          />
        ),

        // Custom styling for strong (bold) text
        strong: ({ ...props }) => (
          <strong
            style={{
              color: theme.palette.text.primary,
              fontWeight: 600,
            }}
            {...props}
          />
        ),

        // Custom styling for emphasized (italic) text
        em: ({ ...props }) => (
          <em
            style={{
              color: theme.palette.text.secondary,
              fontStyle: "italic",
            }}
            {...props}
          />
        ),

        // Custom styling for ordered lists (ol)
        ol: ({ children, start = 1, ...props }) => {
          let itemIndex = start - 1; // Convert to 0-based index
          return (
            <ol
              style={{
                listStyle: "none",
                paddingLeft: "1.5em",
                fontFamily: "'PT Sans Narrow', sans-serif",
                color: theme.palette.text.primary,
                marginTop: 8,
                marginBottom: 8,
              }}
              {...props}
            >
              {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                  // Clone the child and pass the current index for ordered list
                  return React.cloneElement(child, {
                    ordered: true,
                    index: itemIndex++,
                  });
                }
                return child;
              })}
            </ol>
          );
        },

        // Custom styling for unordered lists (ul)
        ul: ({ children, ...props }) => (
          <ul
            style={{
              listStyle: "none",
              paddingLeft: "1.5em",
              fontFamily: "'PT Sans Narrow', sans-serif",
              color: theme.palette.text.primary,
              marginTop: 8,
              marginBottom: 8,
            }}
            {...props}
          >
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                // Clone the child and pass the ordered flag as false for unordered list
                return React.cloneElement(child, { ordered: false });
              }
              return child;
            })}
          </ul>
        ),

        // Custom styling for list items (li)
        li: ({ ordered, index, children, ...props }) => (
          <li
            style={{
              position: "relative",
              paddingLeft: "1.5em",
              marginBottom: "0.5em",
              color: theme.palette.text.primary,
            }}
            {...props}
          >
            <span
              style={{
                position: "absolute",
                left: 0,
                minWidth: "1.5em",
                textAlign: "right",
                paddingRight: "0.3em",
                color: theme.palette.text.primary,
                fontWeight: 600,
              }}
            >
              {ordered ? `${index + 1}.` : "⬩"}
            </span>
            {children}
          </li>
        ),

        // Custom styling for tables
        table: ({ ...props }) => (
          <table
            style={{
              fontFamily: "'PT Sans Narrow', sans-serif",
              width: "100%",
              marginBottom: "1em",
              borderCollapse: "collapse",
              color: theme.palette.text.primary,
            }}
            {...props}
          />
        ),

        // Custom styling for table headers (th)
        th: ({ ...props }) => (
          <th
            style={{
              textAlign: "left",
              padding: "6px 12px",
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
            }}
            {...props}
          />
        ),

        // Custom styling for table data (td)
        td: ({ ...props }) => (
          <td
            style={{
              padding: "6px 12px",
              borderBottom: `1px solid ${theme.palette.divider}`,
              backgroundColor: isDark
                ? theme.palette.background.paper
                : theme.palette.background.default,
            }}
            {...props}
          />
        ),

        // Custom styling for links
        a: ({ ...props }) => (
          <Link
            style={{
              color: isDark
                ? theme.palette.secondary.light
                : theme.palette.primary.main,
              fontWeight: "bold",
              textDecoration: "underline",
              textDecorationColor: isDark
                ? theme.palette.secondary.light
                : theme.palette.primary.main,
            }}
            {...props}
          />
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
};

export default NotesMarkdown;
