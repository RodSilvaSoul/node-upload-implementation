import { describe, test, expect, jest } from '@jest/globals';
import { ViewManager } from '../public/src/view-manager.js';

describe('#view-manager  test suite', () => {
  describe('#configureModal', () => {
    test('it should configure the modal element properly', () => {
      jest
        .spyOn(global.document, 'getElementById')
        .mockImplementation((id) => id);

      const modalMock = {
        Modal: {
          init: jest.fn(() => true),
        },
      };

      const viewManger = new ViewManager();

      viewManger.configureModal(modalMock);

      expect(modalMock.Modal.init).toHaveBeenCalledWith(
        'progressModal',
        expect.objectContaining({
          opacity: 0,
          dismissable: false,
          onOpenEnd: expect.any(Function),
        }),
      );

      expect(viewManger.modalInstance).toBe(true);
    });
  });

  describe('#openModal', () => {
    test('it should open the current modal instance', () => {
      const viewManager = new ViewManager();

      const modalInstanceMock = {
        open: jest.fn(),
      };

      viewManager.modalInstance = modalInstanceMock;

      viewManager.openModal();

      expect(modalInstanceMock.open).toHaveBeenCalled();
    });
  });

  describe('#closeModal', () => {
    test('it should close the current modal instance', () => {
      const viewManager = new ViewManager();

      const modalInstanceMock = {
        close: jest.fn(),
      };

      viewManager.modalInstance = modalInstanceMock;

      viewManager.closeModal();

      expect(modalInstanceMock.close).toHaveBeenCalled();
    });
  });

  describe('#updateStatus', () => {
    test('it should update the modal progress bar status', () => {
      jest
        .spyOn(global.document, global.document.getElementById.name)
        .mockImplementation(() => ({}));

      const viewManager = new ViewManager();

      const size = 10;

      viewManager.updateStatus(size);

      expect(viewManager.output).toMatchObject({
        innerHTML: `Uploading in <b>${size}%</b>`,
      });

      expect(viewManager.progressBar).toMatchObject({
        value: size,
      });
    });
  });

  describe('#configureFileChange', () => {
    test('it should register a function to listen the event on change of the input', () => {
      jest
        .spyOn(global.document, global.document.getElementById.name)
        .mockImplementation(() => ({}));

      const viewManger = new ViewManager();

      viewManger.configureFileChange(() => {});

      expect(viewManger.fileElem).toMatchObject({
        onchange: expect.any(Function),
      });
    });
  });

  describe('#configureFileBtnClick', () => {
    test('it should forward the buttons click event to the input', () => {
      jest
        .spyOn(global.document, global.document.getElementById.name)
        .mockImplementation(() => ({}));

      const viewManger = new ViewManager();

      viewManger.configureFileBtnClick(() => {});

      expect(viewManger.newFileBtn).toMatchObject({
        onclick: expect.any(Function),
      });
    });
  });

  describe('#getIcon', () => {
    test('it should choose the correctly icon type for the current file format', () => {
      const file = 'archive.mp4';

      const viewManager = new ViewManager();

      const iconType = viewManager.getIcon(file);

      expect(iconType).toBe('movie');
    });
  });

  describe('#makeIcon', () => {
    test('it should make the correctly icon for the current file format', () => {
      const file = 'archive.mp4';

      const viewManager = new ViewManager();

      jest
        .spyOn(viewManager, viewManager.getIcon.name)
        .mockReturnValue('movie');

      const icon = viewManager.makeIcon(file);

      expect(icon).toBe(`<i class="material-icons red600 left">movie</i>`);
      expect(viewManager.getIcon).toHaveBeenCalledWith(file);
    });
  });

  describe('#updateCurrentFiles', () => {
    test('it should generate the correctly tbody content given a array of files', () => {
      jest
        .spyOn(global.document, global.document.getElementById.name)
        .mockImplementation(() => ({}));

      const files = [
        {
          size: 'any_size',
          owner: 'any_owner',
          lastModified: 'any_date',
          file: 'any_file',
        },
        {
          size: 'any_size',
          owner: 'any_owner',
          lastModified: 'any_date',
          file: 'any_file',
        },
      ];

      const viewManager = new ViewManager();

      const mockedFormatter = {
        format: jest.fn(() => 'any_date'),
      };

      viewManager.formatter = mockedFormatter;

      jest
        .spyOn(viewManager, viewManager.makeIcon.name)
        .mockReturnValue('any_icon');

      viewManager.updateCurrentFiles(files);

      const makeExpectedHtml = () => {
        return files
          .map(
            (item) => `
            <tr>
                <td>any_icon</td>
                <td>${item.owner}</td>
                <td>${item.lastModified}</td>
                <td>${item.size}</td>
            </tr>
            `,
          )
          .join('')
          .replace(/ /g, '');
      };

      expect(viewManager.tbody.innerHTML.replace(/ /g, '')).toBe(
        makeExpectedHtml(),
      );
    });
  });
});
