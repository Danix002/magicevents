import React from 'react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: 20, textAlign: 'center' }}>
                    <h2>Oops! Qualcosa è andato storto.</h2>
                    <p>Ricarica la pagina o riprova più tardi.</p>
                </div>
            );
        }
        return this.props.children;
    }
}
