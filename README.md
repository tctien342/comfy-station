# ComfyUI Station

A web application for manager multiple instances of ComfyUI.

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-donate-yellow.svg)](https://www.buymeacoffee.com/tctien342)

![Task](https://github.com/user-attachments/assets/38f8e021-6d9f-48d2-adbf-b13024f36667)

## Core Features
1.	Client Management
- Registration, setup, and authentication for new clients.
2.	Client Monitoring
- Real-time CPU, memory, and GPU monitoring.
- Event logging for client status changes.
3.	Client Extensions
- Manage and configure client-specific extensions.
4.	User & Access Management
- User account management, roles, authentication, and token sharing.
5.	Job & Task Automation
- Schedule, manage, and monitor jobs and tasks across clients.
6.	Workflow System
- Create, execute, and track workflows across multiple clients.
7.	Client Actions & Events
- Log client actions and manage event responses.

## How to run this
- Install [BunJS](https://bun.sh/) and [LTS NodeJS](https://nodejs.org/en)
- Pull the latest sources `git clone https://github.com/tctien342/comfy-station.git`
- `cd comfy-station` and execute `bun install`
- Copy `.env.example` to `.env` and edit all variable, leave all S3 blank if you want to use local storage
- Create Admin(Level 5) user with following command: `bun cli user --email admin@example.com -p admin1234 -l 5`
  - There is Editor(Level 4) user, who can only create and execute workflow `-l 4`
  - There is User(Level 3) user, who can only execute workflow `-l 3`
- Start the application:
    - Development: `bun dev`
    - Production: `bun run build` then `bun start`
- After the application is started, you can add your ComfyUI node using button on the bottom left
- Then export your workflow from the ComfyUI using `Export (API)` button and then import into application using import workflow button on top.
- Mapping all input node and output node for your workflow and then you can try it.
> Web app will running on port 3000 and Backend will be on port 3001

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Tran Cong Tien - tctien342@gmail.com
