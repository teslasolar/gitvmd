# Contributing to GitVMD

Thank you for your interest in contributing to GitVMD! This document provides guidelines and instructions for contributing.

## Code of Conduct

This project adheres to the Contributor Covenant Code of Conduct. By participating, you are expected to uphold this code.

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear description** of the issue
- **Steps to reproduce** the behavior
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment details** (browser, OS, variant used)
- **Console errors** from browser DevTools

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear description** of the proposed feature
- **Use cases** and motivation
- **Possible implementation** approach
- **Alternatives considered**

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Follow the coding style** of the project
3. **Add tests** for new functionality
4. **Update documentation** as needed
5. **Ensure all tests pass** (`npm test`)
6. **Keep commits focused** and write clear commit messages

#### Branch Naming

- Feature: `feature/description`
- Bug fix: `fix/description`
- Documentation: `docs/description`
- Performance: `perf/description`

#### Commit Messages

Follow conventional commits:

```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

Examples:
```
feat(ai): add WebLLM integration
fix(vm): resolve boot timeout issue
docs(readme): update installation instructions
```

### Development Setup

```bash
# Clone your fork
git clone https://github.com/yourusername/gitvmd.git
cd gitvmd

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Type check
npm run type-check
```

### Testing

- Write unit tests for new functions
- Add integration tests for new features
- Ensure existing tests pass
- Aim for >80% code coverage

```bash
# Run all tests
npm test

# Run specific test file
npm test -- path/to/test.spec.js

# Run with coverage
npm run test:coverage
```

### Code Style

- Use ESLint configuration provided
- Format with Prettier (integrated in ESLint)
- Use TypeScript for type safety (JSDoc for JS files)
- Follow existing patterns in the codebase

### Documentation

Update documentation for:
- New features
- API changes
- Configuration options
- Architecture changes

Documentation locations:
- `README.md` - User-facing documentation
- `ARCHITECTURE.md` - Technical architecture
- `docs/` - Detailed guides
- Code comments - Implementation details

### Adding a New Variant

1. Create configuration file in `src/config/variants/`
2. Follow schema in `src/config/schema.json`
3. Test the variant thoroughly
4. Update README with variant description
5. Add integration tests

Example:
```json
{
  "extends": "default",
  "name": "My Variant",
  "description": "Description of my variant",
  "vm": {
    "memory": "512M",
    ...
  }
}
```

### Adding AI Models

1. Add model configuration to variant
2. Implement loading strategy
3. Add tests for model loading
4. Update documentation
5. Consider size implications (<100MB preferred)

### Performance Considerations

- Keep initial bundle < 3MB
- Lazy load large assets
- Use Web Workers for heavy computation
- Profile performance changes
- Test on low-end devices

### Security

- Never commit secrets or credentials
- Validate all user inputs
- Follow Content Security Policy
- Use HTTPS for external resources
- Report security issues privately

## Project Structure

```
gitvmd/
├── src/
│   ├── core/          # Core VM engine and storage
│   ├── ui/            # UI components
│   ├── ai/            # AI integration
│   ├── config/        # Configuration system
│   └── workers/       # Web Workers
├── scripts/           # Build and utility scripts
├── tests/             # Test suites
├── docs/              # Documentation
└── .github/           # CI/CD workflows
```

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create release branch: `release/vX.Y.Z`
4. Run full test suite
5. Create pull request to `main`
6. After merge, create GitHub release
7. Tag release: `git tag vX.Y.Z`

## Getting Help

- **Issues**: Open a GitHub issue
- **Discussions**: Use GitHub Discussions for questions
- **Chat**: Join our Discord (link in README)

## Recognition

Contributors will be recognized in:
- `CONTRIBUTORS.md` file
- GitHub contributors page
- Release notes for significant contributions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to GitVMD! 🎉
